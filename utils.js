function createTrigger({ trigger = "", multiple = false, accept = "", dragable = false } = {}) {
  let input = null;
  if (trigger) {
    this.target = document.querySelector(trigger);
    if (dragable) {
      document.addEventListener("drop", preventDefault);
      document.addEventListener("dragleave", preventDefault);
      document.addEventListener("dragenter", preventDefault);
      document.addEventListener("dragover", preventDefault);
      this.target.addEventListener("drop", dropEvent.bind(this));
    }
  }
  input = document.createElement("input");
  input.type = "file";
  input.multiple = multiple;
  input.accept = accept;
  input.addEventListener("change", changeEvent.bind(this));
  console.log(this);
  input.value = "";

  return input;
}

function preventDefault(e) {
  e.preventDefault();
}

const dropEvent = (e) => {
  let file = e.dataTransfer.files[0];
  this._verifyFile(file);
}

function changeEvent(e) {
  console.log(this);
  let file = e.target.files[0];
  this._verifyFile(file);
}

function removeTrigger() {
  this.target.removeEventListener("drop", dropEvent)
  this.trigger.removeEventListener("change", changeEvent)
  this.trigger = null
  this.target = null
  document.removeEventListener("drop", preventDefault);
  document.removeEventListener("dragleave", preventDefault);
  document.removeEventListener("dragenter", preventDefault);
  document.removeEventListener("dragover", preventDefault);
}

// module.exports = {
//   createTrigger
// }
