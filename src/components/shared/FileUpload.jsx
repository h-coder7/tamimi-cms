"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import VideoLightbox from "./VideoLightbox";

const isImageFile = (file) => {
    if (file.type?.startsWith('image/')) return true;
    const extension = file.name?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
};

const getFileIcon = (file) => {
    if (!file) return 'fa-file-alt';
    if (isImageFile(file)) return 'fa-file-image';

    // Check type or extension/name for other types if type is missing
    const type = file.type || '';
    const name = file.name || '';

    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'fa-file-pdf';
    if (type.includes('excel') || type.includes('spreadsheet') || name.endsWith('.xls') || name.endsWith('.xlsx')) return 'fa-file-excel';
    if (type.includes('word') || type.includes('document') || name.endsWith('.doc') || name.endsWith('.docx')) return 'fa-file-word';
    if (type.startsWith('video/') || name.match(/\.(mp4|webm|ogg|mov|avi)$/i)) return 'fa-file-video';

    return 'fa-file-alt';
};

// ... implementation ...



const DEFAULT_ACCEPT = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.svg'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc', '.dot'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt']
};

export default function FileUpload({
    files = [],
    onFilesChange,
    maxFiles = 10,
    accept = DEFAULT_ACCEPT,
    title = "Attachments",
    hint = ""
}) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState("");

    const onDrop = useCallback((acceptedFiles) => {
        const newAttachments = acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type
        }));

        if (maxFiles === 1) {
            onFilesChange(newAttachments);
        } else {
            onFilesChange([...files, ...newAttachments]);
        }
    }, [files, onFilesChange, maxFiles]);

    const removeAttachment = (indexToRemove) => {
        const updatedFiles = files.filter((_, index) => index !== indexToRemove);
        onFilesChange(updatedFiles);
    };

    const handleFileClick = (file) => {
        const type = file.type || '';
        const name = file.name || '';
        if (type.startsWith('video/') || name.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
            setActiveVideoUrl(file.preview);
            setLightboxOpen(true);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles
    });

    return (
        <div className="upload-comp">
            <label className="form-label mb-2 fsz-13 fw-600 text-uppercase text-muted letter-spacing-1">
                {title}
            </label>

            <div
                {...getRootProps()}
                className={`
                    d-flex flex-column align-items-center justify-content-center p-2
                    border-2 border-dashed rounded-4 transition-all cursor-pointer mb-2
                    ${isDragActive ? 'bg-primary-soft border-primary' : 'bg-light border-secondary-subtle'}
                `}
                style={{
                    minHeight: '80px',
                    transition: 'all 0.2s ease',
                    borderColor: isDragActive ? 'var(--bs-primary)' : '#e2e8f0'
                }}
            >
                <input {...getInputProps()} />
                <div className={`icon-35 rounded-circle d-flex align-items-center justify-content-center mb-1 ${isDragActive ? 'bg-primary text-white' : 'bg-white shadow-sm'}`}>
                    <i className={`fal ${isDragActive ? 'fa-box-open' : 'fa-cloud-upload'} fsz-16`}></i>
                </div>
                <p className="fsz-10 text-muted mb-0 text-center">
                    {hint || `Images, PDF, Doc, Excel, Video (Max ${maxFiles})`}
                </p>
            </div>

            {/* Attachments List */}
            {files.length > 0 && (
                <div className="d-flex flex-column gap-2 mt-3">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="position-relative p-2 rounded-3 border bg-white d-flex align-items-center gap-3 cursor-pointer hover-bg-light"
                            onClick={() => handleFileClick(file)}
                        >
                            <div className="icon-40 rounded-3 overflow-hidden bg-light flex-shrink-0 border d-flex align-items-center justify-content-center">
                                {isImageFile(file) ? (
                                    <img
                                        src={file.preview}
                                        alt="Preview"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                ) : (
                                    <i className={`fal ${getFileIcon(file)} fsz-18`}></i>
                                )}
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                                <h6 className="fsz-12 fw-600 mb-0 text-truncate">{file.name}</h6>
                                <p className="fsz-10 text-muted mb-0">{file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}</p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-icon btn-sm text-danger hover-bg-danger-soft rounded-circle"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeAttachment(index);
                                }}
                            >
                                <i className="fal fa-trash-alt"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <VideoLightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                videoUrl={activeVideoUrl}
            />
        </div>
    );
}
