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
fileUpload.addEventListener('change', uploadFile, false);
submit.addEventListener('submit', sendNext);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    uploadFile(files);
};

function previewFile() {
    if (fileUpload.value) {
        // customText.innerHTML = fileUpload.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        customText.innerHTML = fileUpload.value;
    } else {
        customText.innerHTML = "";
    }
};

function uploadFile(evt) {
    evt.preventDefault();
    previewFile();
    var contents;
    var f = evt.target.files[0];
    
    if (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
            contents = e.target.result.split("\r\n");
            preview = document.getElementById('test');
            // alert("Got the file name: " + f.name + "contents: "
            // + contents[0]);
            // preview.innerHTML = e.target.result;

            fetch(`${SERVER_URI}/input-file`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({contents})
            })
            .then((res) => { return res.json();})
            .then( (j) => {
                  setLocalStorage('sfg_equations', JSON.stringify(j));
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
    
    // const circuit = await resp.json();
}

// Generate button
function sendNext(event) {
    // event.preventDefault();
    const eqns = getCookie('sfg_equations');
    console.log(eqns);
    fetch(`${SERVER_URI}/computeSFG`)
      .then( (res) => {
          return res.json();
      })
      .then( (j) => {
          localStorage.clear();
          setLocalStorage('sfg_nodes', JSON.stringify(j));
      })
      .catch((ex) => {
          console.log(ex);
        // alert('Failed to computeSFG!')
    });

    // const masons = getCookie('sfg_nodes');
    const transFM = "20 * log10 ( sqrt( ((9000000) / (w*w*w*w + 1800*w*w + 810000)) + ((10000) / (w*w*w*w + 1800*w*w + 810000))*w*w ))";
    const transFP = "atan(((((-100)) / (w*w + 900))*w) / (((3000) / (w*w + 900)))) * 180 / pi";
    // console.log(masons);
    // fetch(`${SERVER_URI}/computeMasons`)
    //     .then( (res) => {
    //         return res.json();
    //     })
    //     .catch((ex) => {
    //         console.log(ex);
    //         alert('Failed to computeMasons!')
    //     });
}

function setLocalStorage(key, val) {
    console.log(`Setting cookie: { ${key}=${val} }`);
    localStorage.setItem(key, val);
}

function getCookie(key) {
    return localStorage.getItem(key);
}

