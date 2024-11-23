const drag = document.getElementById("drop-zone");
const topp = document.getElementById("drop-top");
const bottom = document.getElementById("drop-bottom");
const left = document.getElementById("drop-left");
const right = document.getElementById("drop-right");
const textBox = document.getElementById("dragtext");
const uploadname = document.getElementById("uploadname");
let fileSection = document.getElementById("files");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadbutton");
const uploadPercent = document.querySelector("#uploadbutton span");
const remaining = document.querySelector(".vol-remaining");
const vol = document.getElementById("vol");

let selectedFile = null; // Variable to keep track of selected file

window.onload = () => {
  isEmpty();
};

if (vol.textContent > 3.75) {
  remaining.style.backgroundColor = "#86e01e";
  remaining.style.color = "#646464";
} else if (vol.textContent > 2.5 && vol.textContent <= 3.75) {
  remaining.style.backgroundColor = "#f2b01e";
  remaining.style.color = "#646464";
} else if (vol.textContent > 1.25 && vol.textContent <= 2.5) {
  remaining.style.backgroundColor = "#f68a0f";
  remaining.style.color = "#646464";
} else if (vol.textContent > 0 && vol.textContent <= 1.25) {
  remaining.style.backgroundColor = "#f63a0f";
  remaining.style.color = "#fff";
} else if (vol.textContent == 0) {
  remaining.classList.add("vol-finished");
  remaining.addEventListener("mouseover", () => {
    remaining.textContent = "Click to buy more space";
    // make it clickable
    remaining.addEventListener("click", () => {
      Swal.fire({
        title: "Buy More Space",
        text: "You can buy more space by clicking the button below",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText:
          '<a href="./purchase" style="color: #fff; text-decoration: none;">Buy</a>',
      });
    });
  });
  remaining.addEventListener("mouseout", () => {
    remaining.textContent = "0.0 Remaining";
  });
}

// Upload ajax request
const form = document.querySelector("form");
// Submit form event
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  if (selectedFile === fileInput.files[0]) {
    // File is already selected for upload
    Swal.fire({
      title: "Already Selected",
      text: "You have already selected this file for upload",
      icon: "warning",
      showConfirmButton: true,
      customClass: {
        confirmButton: "swal2-confirm-button",
      },
    });
    return;
  }

  selectedFile = fileInput.files[0]; // Update selected file

  // Compress the selected file before sending it to the server
  const reader = new FileReader();

  reader.onload = function (event) {
    const fileData = event.target.result;

    // Compress the file data using pako
    const compressedData = pako.deflate(new Uint8Array(fileData));
  
    // Convert the compressed data to a Blob
    const compressedFile = new Blob([compressedData], { type: selectedFile.type });
  
    // Update the formData with the compressed file data
    formData.set("file", compressedFile, selectedFile.name);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", form.getAttribute("action"));
  // if file does not selected
  if (fileInput.files.length === 0) {
    Swal.fire({
      title: "Should I upload nothing ?",
      text: "Please select a file to upload",
      imageUrl: "./images/nothing-selected.svg",
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Nothing selected",
      customClass: {
        confirmButton: "swal2-confirm-button",
      },
    });
    return;
  }

  // Progress bar
  xhr.upload.addEventListener("progress", (event) => {
    if (event.lengthComputable) {
      event.preventDefault();
      var percentComplete = (event.loaded / event.total) * 100;

      topp.style.width = percentComplete + 1 + "%";
      bottom.style.width = percentComplete + 1 + "%";
      left.style.height = percentComplete + "%";
      right.style.height = percentComplete + "%";

      console.log(percentComplete); // Just test on console

      // Make progress bar colors ...
      if (0 <= percentComplete && percentComplete <= 25) {
        topp.style.backgroundColor = "#f63a0f";
        bottom.style.backgroundColor = "#f63a0f";
        left.style.backgroundColor = "#f63a0f";
        right.style.backgroundColor = "#f63a0f";
      } else if (25 < percentComplete && percentComplete <= 50) {
        topp.style.backgroundColor = "#f27011";
        bottom.style.backgroundColor = "#f27011";
        left.style.backgroundColor = "#f27011";
        right.style.backgroundColor = "#f27011";
      } else if (50 < percentComplete && percentComplete <= 75) {
        topp.style.backgroundColor = "#f2d31b";
        bottom.style.backgroundColor = "#f2d31b";
        left.style.backgroundColor = "#f2d31b";
        right.style.backgroundColor = "#f2d31b";
      } else if (75 < percentComplete && percentComplete <= 100) {
        if (percentComplete == 100) {
          const uploadSuccess = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
          uploadSuccess.fire({
            icon: "success",
            title: "Uploaded Successfully",
          });
        }
        topp.style.backgroundColor = "#86e01e";
        bottom.style.backgroundColor = "#86e01e";
        left.style.backgroundColor = "#86e01e";
        right.style.backgroundColor = "#86e01e";
      }
      textBox.innerText = percentComplete.toFixed(0) + "% Uploaded.";
    }
  });

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      textBox.innerHTML = response.message; // Log the success message to the console
    } else if (xhr.readyState === 4 && xhr.status === 400) {
      var response = JSON.parse(xhr.responseText);
      textBox.innerHTML = response.errors; // Log the validation errors to the console
    }
  };

  xhr.send(formData);
};
  reader.readAsArrayBuffer(selectedFile);
});

// Function for converting sizes and show it
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ******************* //
function makeEmpty() {}
// ******************* //

// Check if input is empty
function isEmpty() {
  setTimeout(() => {
    if (fileSection.childElementCount == 0) {
      window.scrollTo(0, 0);
      fileSection.style.opacity = 0;
      fileSection.style.display = "none";
      uploadname.innerText = "Nothing Selected";
      uploadname.style.color = "#ccc";
      drag.style.backgroundColor = "#f8f8f8";
      fileInput.value = null;
      fileInput.disabled = false;
      textBox.innerText = "Drag or Click here";
      topp.style.width = 0 + "%";
      bottom.style.width = 0 + "%";
      left.style.height = 0 + "%";
      right.style.height = 0 + "%";
    } else {
      fileSection.style.opacity = 0.7;
      textBox.innerText = "File Selected";
    }
  }, 40);
}

// Remove file from input
function delFile(e) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", "Your file has been deleted.", "success");
      e.style.opacity = 0;
      e.addEventListener("transitionend", () => {
        e.remove();
        isEmpty();
      });
    }
  });
}

// For drag and drop
drag.addEventListener("dragover", (e) => {
  console.log(e);
  drag.style.backgroundColor = "#e8e8e8";
  drag.style.color = "#a1a1a1";
  textBox.innerText = "DROP BABE";
});
drag.addEventListener("dragleave", () => {
  drag.style.backgroundColor = "#f8f8f8";
  drag.style.color = "#ccc";
  textBox.innerText = "Click Or Drag Here";
});
drag.addEventListener("drop", () => {
  drag.style.backgroundColor = "#f8f8f8";
  drag.style.color = "#ccc";
  textBox.innerText = "OKAY BABE";
});

// Add file section bar when input is not empty
drag.addEventListener("change", (e) => {
  let input = document.querySelector('input[type="file"]');
  let uploadName = input.files[0].name;
  let uploadSize = formatBytes(input.files[0].size);
  let fileSection = document.getElementById("files");
  if (input.files[0].size <= 1000000000 && fileSection.childElementCount == 0) {
    fileSection.style.display = "block";
    fileSection.innerHTML += `        <button onclick="delFile(this)">
      <div id="cancel">
        <i class="fa fa-trash" aria-hidden="true"></i>
      </div>
      <div>
      <i class="fas fa-file fa-2xl" style="color: #c0bfbc; opacity: 1; position: relative; margin-bottom: 25px;"></i>
      </div>
      <hr style="opacity: .2"><br>
    ${uploadName}<br>
    ${uploadSize} 
    </button>`;
    uploadname.style.color = "#fff";
    uploadname.innerText = uploadName;
    fileInput.disabled = true;
    drag.style.backgroundColor = "#6e6e6e";
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 300);
  }
  //  else if (fileSection.childElementCount > 0) {
  //   const Toast = Swal.mixin({
  //     toast: true,
  //     position: 'top-end',
  //     showConfirmButton: false,
  //     timer: 3000,
  //     timerProgressBar: true,
  //     didOpen: (toast) => {
  //       toast.addEventListener('mouseenter', Swal.stopTimer)
  //       toast.addEventListener('mouseleave', Swal.resumeTimer)
  //     }
  //   })

  //   Toast.fire({
  //     icon: 'error',
  //     title: 'Just 1 file at a time'
  //   })
  //}
  else {
    const sizeError = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    sizeError.fire({
      icon: "error",
      title: "File must be less than 1GB",
    });
  }
  isEmpty();
});
