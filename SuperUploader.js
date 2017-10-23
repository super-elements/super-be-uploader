/* eslint no-underscore-dangle: ["error", { "allow": ["_valueChanged",
 "_createPreviews",
 "_filesChanged"]}]*/
/* global someFunction document, key */

Polymer({
  is: 'super-uploader',
  properties: {
    /**
     * To upload multiple files.
     *
     * @attribute multiple
     * @type Boolean
     * @default 'false'
     */
    multiple: {
      type: Boolean,
      notify: false,
      value: false,
    },
    /**
     * This contain the information of file like originalName, fileExtension, changedFileName etc.
     * @attribute files
     * @type Array
     */
    files: {
      type: Array,
      value: [],
      observer: '_filesChanged',
    },
    /**
     * This stores the Files name in the form of array of object with a key name `uploaderimage` .
     * Previous File store in an HTTP format.
     * Current Files stores with a current filename.
     */
    value: {
      type: Array,
      value: [],
      observer: '_valueChanged',
    },
    /**
     * Define the types of files that server wants.
     */
    accept: {
      type: String,
      value: '',
    },
  },

  // This fires when filename add in the value .
  _valueChanged() {
    this._createPreviews();
  },
  _filesChanged() {
    this.fire('filesChanged');
  },
  _createPreviews() {
    const self = this;

    function findkey(key, str, filearr) {
      for (let k = 0; k < filearr.length; k++) {
        if (filearr[k][key] === str) {
          return filearr[k];
        }
      }
    }
    if ((this.value === '' || this.value == null) && self.querySelector('[preview]')) {
      self.querySelector('[preview]').innerHTML = '';
    }
    for (let valueindex = 0; valueindex < this.value.length; valueindex++) {
      // The image has been uploaded a new
      if (this.value[valueindex].uploaderimage === '' ||
      this.value[valueindex].uploaderimage == null) {
        self.querySelector('[preview]').innerHTML = '';
      } else if (this.value[valueindex].uploaderimage.indexOf('://') === -1) {
        // We have to display an already uploaded file. The name of the file
        // will have an absolute path and therefore have the `://` as part of the
        // protocol -> http / ftp etc.
        self.querySelector('[preview]').innerHTML = '';

        // Match filename from this.value and this.file
        const fileObject = findkey('name', this.value[valueindex].uploaderimage, self.files);
        if (fileObject) {
          (function(fileObject) {
            const reader = new FileReader();
            if ((fileObject.type === 'image/jpg') ||
              (fileObject.type === 'image/JPG') ||
              (fileObject.type === 'image/PNG') ||
              (fileObject.type === 'image/png') ||
              (fileObject.type === 'image/JPEG') ||
              (fileObject.type === 'image/jpeg')) {
              reader.onload = () => {
                const imageTag = document.createElement('img');
                imageTag.src = reader.result;
                imageTag.style.width = '100%';
                imageTag.style.height = '100%';
                self.querySelector('[preview]').appendChild(imageTag);
              };
              reader.readAsDataURL(fileObject);
            } else if ((fileObject.type === 'video/mp4') ||
             (fileObject.type === 'video/3gp') ||
             (fileObject.type === 'video/avi')) {
              reader.onload = () => {
                // To create video Tag
                const vid = document.createElement('video');
                vid.controls = true;
                vid.src = reader.result;
                vid.style.width = '100%';
                vid.style.height = '100%';
                self.querySelector('[preview]').appendChild(vid);
              };
              reader.readAsDataURL(fileObject);
            } else {
              // TODO Write better error handling as well as error handling for
              // things already defined in this.value
              throw (new Error('Error! Unknown file type for' + fileObject.uploaderimage));
            }
          })(fileObject);
        }
      } else {
        // Image is in the uploader's `value` property but not uploaded now by the user.
        const fileExtension = self.value[valueindex].uploaderimage.split('.').pop();
        if ((fileExtension === 'jpg') ||
          (fileExtension === 'JPG') ||
          (fileExtension === 'jpeg') ||
          (fileExtension === 'JPEG') ||
          (fileExtension === 'PNG') ||
          (fileExtension === 'png')) {
          self.querySelector('[preview]').innerHTML = '';
          const imageTag = document.createElement('img');
          imageTag.src = self.value[valueindex].uploaderimage;
          imageTag.style.width = '100%';
          imageTag.style.height = '100%';
          self.querySelector('[preview]').appendChild(imageTag);
        } else if ((fileExtension === 'mp4') ||
          (fileExtension === 'avi') ||
          (fileExtension === '3gp')) {
          const vid = document.createElement('video');
          vid.controls = true;
          vid.src = self.value[valueindex].uploaderimage;
          vid.style.width = '100%';
          vid.style.height = '100%';
          self.querySelector('[preview]').appendChild(vid);
        }
        // else {
        //   // TODO Write better error handling as well as error handling for
        //   // things already defined in this.value
        //   throw (new Error('Unknown File Extension'));
        // }
      }
    }
  },

  ready() {
    const self = this;
    /* to show the files coming from database */
    self._createPreviews();
    if (this.querySelector('[uploader]')) {
      this.querySelector('[uploader]').addEventListener('click', () => {
        self.$.addinputfiles.click((self) => {});
      });
      this.$.addinputfiles.addEventListener('change', () => {
        self.fire('change');
        // Incase we need to upload one at a time.
        // Simply reset `value` and `file`
        if (!this.multiple) {
          self.files = [];
          self.value = [];
        }
        for (let i = 0; i < self.$.addinputfiles.files.length; i++) {
          self.files.push(self.$.addinputfiles.files[i]);
        }
        for (let j = 0; j < self.$.addinputfiles.files.length; j++) {
          // push the filename in value property.Use key name `uploaderimage`.
          // Due to some limitations.
          self.value.push({
            uploaderimage: (self.$.addinputfiles.files[j].name),
          });
        }
        self._createPreviews();
      });
    }
  },
});
