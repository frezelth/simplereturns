/**
 * dnd.js
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Aurora Extensions EULA,
 * which is bundled with this package in the file LICENSE.txt.
 *
 * It is also available on the Internet at the following URL:
 * https://docs.auroraextensions.com/magento/extensions/2.x/simplereturns/LICENSE.txt
 *
 * @package       AuroraExtensions_SimpleReturns
 * @copyright     Copyright (C) 2019 Aurora Extensions <support@auroraextensions.com>
 * @license       Aurora Extensions EULA
 */
define([
    'jquery',
    'dropzone',
    'AuroraExtensions_SimpleReturns/js/url/builder',
    'AuroraExtensions_SimpleReturns/js/url/parser',
    'AuroraExtensions_SimpleReturns/js/utils/dataTypes'
], function ($, Dropzone, urlBuilder, urlParser, dataTypes) {
    'use strict';

    var widget, urn;

    /** @var {Object} widget */
    widget = {
        /** @property {String} name */
        name: 'simpleReturnsDragAndDrop',
        /** @property {String} container */
        container: 'mage',
        /** @property {Object|null} dropzone */
        dropzone: null,
        /**
         * @property {Object} options
         */
        options: {
            createPath: '/simplereturns/rma_attachment/createPost/',
            deletePath: '/simplereturns/rma_attachment/deletePost/',
            files: [],
            formKey: null,
            preload: false,
            rmaId: null,
            searchPath: '/simplereturns/rma_attachment/searchPost/',
            selector: '.dropzone',
            token: null,
            tokens: []
        },
        /**
         * @return {void}
         */
        _create: function () {
            var options, targetPath;

            /** @var {String} targetPath */
            targetPath = this.options.createPath;

            /** @var {Object} options */
            options = {
                maxFilesize: 100,
                paramName: 'attachments',
                thumbnailHeight: 120,
                thumbnailWidth: 120,
                uploadMultiple: true,
                url: targetPath
            };

            /* Prevent Dropzone from attaching twice. */
            Dropzone.autoDiscover = false;

            /* Set dropzone configuration. */
            Dropzone.options.attachmentDropzone = options;

            this.setDropzone(new Dropzone(this.options.selector, options))
                .initialize();

            if (this.options.preload) {
                this.preload();
            }
        },
        /**
         * @param {File} file
         * @return {void}
         */
        initFile: function (file) {
            var dz, height, width;

            file.upload = {
                uuid: Dropzone.uuidv4(),
                progress: 100,
                total: file.size,
                bytesSent: file.size,
                filename: file.name,
                chunked: false,
                totalChunkCount: 1
            };

            /** @var {Object} dz */
            dz = this.getDropzone();

            /*
             * Add file to queue and change
             * file status to successful.
             */
            dz.files.push(file);
            file.status = Dropzone.SUCCESS;

            dz.emit('addedfile', file);

            /** @var {Number} height */
            height = dz.options.thumbnailHeight;

            /** @var {Number} width */
            width = dz.options.thumbnailWidth;

            dz.createThumbnail(file, width, height, 'crop', true, function (dataUrl) {
                dz.emit('thumbnail', file, dataUrl);
            });
            dz.emit('complete', file);

            dz.accept(file, function () {
                file.accepted = true;

                return dz._updateMaxFilesReachedClass();
            });
        },
        /**
         * @return {void}
         */
        initialize: function () {
            var dz, onFileAdded, onFileRemoved;

            this.options.rmaId = !!this.options.rmaId
                ? this.options.rmaId
                : urlParser.getParamValue('rma_id');

            this.options.token = !!this.options.token
                ? this.options.token
                : urlParser.getParamValue('token');

            /** @var {Object} dz */
            dz = this.getDropzone();

            /** @var {Function} onFileAdded */
            onFileAdded = this.onFileAdded.bind(this);

            /** @var {Function} onFileRemoved */
            onFileRemoved = this.onFileRemoved.bind(this);

            dz.on('addedfile', onFileAdded);
            dz.on('removedfile', onFileRemoved);
        },
        /**
         * @return {Object}
         */
        getDropzone: function () {
            return this.dropzone;
        },
        /**
         * @param {Object} dropzone
         * @return {this}
         */
        setDropzone: function (dropzone) {
            this.dropzone = dropzone;

            return this;
        },
        /**
         * @return {String}
         */
        getUrn: function () {
            return this.container + '.' + this.name;
        },
        /**
         * @return {void}
         */
        preload: function () {
            var blob, buffer,
                dz, files,
                mock, self;

            /** @var {Array} files */
            files = this.options.files;

            if (!files.length) {
                return null;
            }

            /** @var {Object} dz */
            dz = this.getDropzone();

            /** @var {this} self */
            self = this;

            $.each(files, function (key, value) {
                /** @var {Object} mock */
                mock = {
                    name: value.name,
                    size: value.size
                };

                /** @var {Uint8Array} buffer */
                buffer = dataTypes.dataUriToBinary(value.blob);

                /** @var {File} blob */
                blob = new File(
                    [buffer],
                    value.name,
                    {
                        type: value.type
                    }
                );

                self.initFile(blob);
            });
        },
        /**
         * @param {File} file
         * @return {void}
         */
        onFileAdded: function (file) {
            var button, dz;

            /** @var {Object} dz */
            dz = this.getDropzone();

            /** @var {HTMLButtonElement} button */
            button = Dropzone.createElement('<button>REMOVE</button>');
            button.setAttribute('class', 'dz-remove');
            button.setAttribute('type', 'button');

            button.addEventListener('click', function (clickEvent) {
                clickEvent.preventDefault();
                clickEvent.stopPropagation();

                dz.removeFile(file);

                console.log('Inside click event handler.');
            });

            file.previewElement.appendChild(button);
        },
        /**
         * @param {File} file
         * @return {void}
         */
        onFileRemoved: function (file) {
            /** @todo: Work on implementation. */
        }
    };

    /** @var {String} urn */
    urn = widget.getUrn.call(widget);

    $.widget(urn, widget);

    return $[widget.container][widget.name];
});