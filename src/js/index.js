const fileBox = document.getElementById("file-box");
const dropArea = document.getElementById("drop-area");
const fileUpload = document.getElementById("fileUpload");
const customText = document.getElementById("custom-text");
const submit = document.getElementById("generate");

const SERVER_URI = 'http://localhost:3000';

// https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
// To prevent default behaviour
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })
  
function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
};
  
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
});
  
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
});
  
function highlight(e) {
    dropArea.classList.add('highlight')
}
  
function unhighlight(e) {
   dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false);
fileUpload.addEventListener('change', handleUpload, false);
submit.addEventListener('submit', sendNext);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];

    previewFile(file);
    uploadFile(file);
};

function handleUpload(e) {
    let file = e.target.files[0];

    previewFile(file);
    uploadFile(file);
}

function previewFile(file) {
    if (file.name) {
        // customText.innerHTML = fileUpload.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        customText.innerHTML = file.name;
    } else {
        customText.innerHTML = "";
    }
};

function uploadFile(f) {
//     evt.preventDefault();
//     previewFile();
    let contents;
//     let f = evt.target.files[0];
    
    if (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
            contents = e.target.result.split("\r\n");
            // alert("Got the file name: " + f.name + "contents: "
            // + contents[0]);

            let ltspice = contents[0].search('\n') !== -1
              ? contents.toString().split('\n')
              : contents;
            setLocalStorage('ltspice', JSON.stringify(ltspice));
            fetch(`${SERVER_URI}/input-file`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({contents})
            })
            .then((res) => { return res.json();})
            .then( (j) => {
                  setLocalStorage('sfg_equations', JSON.stringify(j.equations));
                  setLocalStorage('circuit_layout', JSON.stringify(j.asc));
                  setLocalStorage('circuit_nodes', JSON.stringify(j.ascNodes));
              })
            .catch(() => 
                {
                    alert("Did not enter the server");
            })
        }
        reader.readAsText(f);      
    }
    else {
        alert("Failed to load file");
    }
}

// Generate button
async function sendNext(event) {
    // event.preventDefault();
    const eqns = getCookie('sfg_equations');
    console.log(eqns);
    await fetch(`${SERVER_URI}/computeSFG`)
      .then( (res) => {
          console.log(res);
          return res.json();
      })
      .then( (j) => {
          setLocalStorage('sfg_nodes', JSON.stringify(j.sfg));
          setLocalStorage('loop_gain', JSON.stringify(j.bode));
      })
      .catch((ex) => {
          console.log(ex);
        // alert('Failed to computeSFG!')
    });
    
    if (eqns.length === 0) {
        alert("Must Upload a netlist File");
        errorMes.innerHTML = "Must Upload a netlist File";
    }

    else {
        location.href='./index.html'
    }
}

function setLocalStorage(key, val) {
    // console.log(`Setting cookie: { ${key}=${val} }`);
    localStorage.setItem(key, val);
}

function getCookie(key) {
    return localStorage.getItem(key);
}

