/* toggle between hiding and showing the dropdown content */
function toggleMenu() {
  document.getElementById("dropdown-content").classList.toggle("show");
}

function toggleExportOptions() {
  document.getElementById("export").classList.toggle("selected-item");
  document.getElementById("export-options").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.menu-btn') && !event.target.matches('.export')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};