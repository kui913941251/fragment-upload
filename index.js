// const { createTrigger } = require("./utils")

let uid = 0;

class Uploader {
  constructor(options = {}) {
    if (Uploader.instance) {
      return Uploader.instance
    }else {
      this._init(options);
      Uploader.instance = this
    }
  }

  _init(options) {
    this.options = Object.assign(
      {
        multiple: false,
        dragable: false,
        useSplit: true,
        accept: "",
        trigger: "",
      },
      options
    );
    this.trigger = createTrigger.call(this, options);
    this.fileList = [];
  }

  click() {
    this.trigger && this.trigger.click();
  }

  start(file) {
    let target = this.fileList.find((item) => item.uid === file.uid);
    this._setStatus(target, READY_STATUS)
    this._uploading(target);
  }

  stop(file) {
    let target = this.fileList.find((item) => item.uid === file.uid);
    this._pause(target)
  }

  on(eventName, fun) {
    if (ALLOW_EVENT.indexOf(eventName) === -1) return this;
    if (this[EVENT_MAP]) {
      this[EVENT_MAP][eventName] = fun;
    } else {
      this[EVENT_MAP] = {
        [eventName]: fun,
      };
    }
    return this;
  }

  destroy() {
    removeTrigger.call(this)
  }

  _verifyFile(file) {
    if (this[EVENT_MAP][BEFORE_CHANGE]) {
      this[EVENT_MAP][BEFORE_CHANGE](file, () => {
        this._add(file);
      });
    } else {
      this._add(file);
    }
  }

  _add(file) {
    let wrapperFile = this._initFile(file);
    if (this[EVENT_MAP][ADD]) {
      this[EVENT_MAP][ADD](wrapperFile, this.fileList);
    }
    console.log(this);
  }

  _initFile(file) {
    const fileName = file.name;
    const fileSize = file.size;
    const ext = fileName.slice(fileName.lastIndexOf("."));
    let chunkSize;
    let chunkNum;
    if (this.options.useSplit) {
      chunkSize = this.options.chunkSize || 5 * 1024 * 1024;
      chunkNum = Math.ceil(this.options.chunkNum || fileSize / chunkSize);
    } else {
      chunkSize = fileSize;
      chunkNum = 1;
    }
    const privateFile = {
      uid: uid++,
      raw: file,
      fileName,
      fileSize,
      ext,
      chunkSize,
      chunkNum,
      offset: 0,
      status: READY_STATUS,
      progress: 0
    };
    this.fileList.push(privateFile);
    return privateFile;
  }

  _uploading(file) {
    if (file.status === UPLOADING_STATUS || file.status === PAUSE_STATUS) return 
    if (file.offset < file.chunkNum) {
      let offset = file.offset,
        chunkSize = file.chunkSize;
      let chunkStart = offset * chunkSize;
      let chunkEnd = (offset + 1) * chunkSize;
      let chunkFile = file.raw.slice(chunkStart, chunkEnd);
      if (this[EVENT_MAP][UPLOADING]) {
        this[EVENT_MAP][UPLOADING](file, chunkFile, () => {
          file.offset++;
          this._uploading(file);
        });
      }
    } else {
      this._finish(file);
    }
  }

  _pause(file) {
    this._setStatus(file, PAUSE_STATUS)
  }

  _finish(file) {
    if (this[EVENT_MAP][FINISH]) {
      this[EVENT_MAP][FINISH](file);
    }
    this._setStatus(file, FINISH_STATUS)
  }

  _setStatus(file, status) {
    switch (status) {
      case READY_STATUS:
        file.status = READY_STATUS;
      case UPLOADING_STATUS:
        file.status = UPLOADING_STATUS;
      case PAUSE_STATUS:
        file.status = PAUSE_STATUS;
      case FINISH_STATUS:
        file.status = FINISH_STATUS;
    }
  }
}

// let upload = new Uploader()
