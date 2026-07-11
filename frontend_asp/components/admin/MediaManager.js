'use client';
import { useState, useRef } from 'react';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Upload, X, Loader2, FileText, Video, ImageOff } from 'lucide-react';

// Shared multi-image + video/PDF attachment manager. Used by the Cranes,
// Services, Projects, and Blog Posts admin forms so all four have the same
// upload/delete behavior instead of four slightly-different copies.
//
// Uploads go to POST /api/upload/multiple (local disk storage — see
// backend_asp/routes/upload.js) and deletes go to DELETE /api/upload?url=...
// so removed files don't pile up on the server.
export default function MediaManager({
  images = [],
  onImagesChange,
  attachments = [],
  onAttachmentsChange,
  imagesLabel = 'Images',
}) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const uploadFiles = async (fileList) => {
    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append('files', f));
    const res = await adminApi.post('/upload/multiple', formData);
    return res.data.data || [];
  };

  const handleImagesSelected = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const uploaded = await uploadFiles(files);
      const imageFiles = uploaded.filter((f) => f.type === 'image');
      if (imageFiles.length < uploaded.length) {
        toast.error('Some files were skipped — only images belong here.');
      }
      onImagesChange([...(images || []), ...imageFiles.map((f) => f.url)]);
      if (imageFiles.length) toast.success(`${imageFiles.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleFilesSelected = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      const uploaded = await uploadFiles(files);
      const docFiles = uploaded.filter((f) => f.type !== 'image');
      const asAttachments = docFiles.map((f) => ({ url: f.url, type: f.type, name: f.originalname }));
      onAttachmentsChange([...(attachments || []), ...asAttachments]);
      if (asAttachments.length) toast.success(`${asAttachments.length} file(s) uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  // Best-effort — even if the physical file is already gone or the delete
  // call fails, we still remove it from the list so the UI doesn't get stuck.
  const deleteFromDisk = async (url) => {
    try {
      await adminApi.delete('/upload', { params: { url } });
    } catch (e) {
      /* ignore — file may already be removed */
    }
  };

  const removeImage = (idx) => {
    const url = images[idx];
    onImagesChange(images.filter((_, i) => i !== idx));
    deleteFromDisk(url);
  };

  const removeAttachment = (idx) => {
    const item = attachments[idx];
    onAttachmentsChange(attachments.filter((_, i) => i !== idx));
    deleteFromDisk(item.url);
  };

  return (
    <div className="space-y-5">
      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="admin-label !mb-0">{imagesLabel}</label>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImages}
            className="btn-secondary text-xs py-1.5"
          >
            {uploadingImages ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Add Images
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={handleImagesSelected} />
        </div>
        {images?.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {images.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="relative group aspect-square rounded-lg overflow-hidden border"
                style={{ borderColor: 'rgba(51,65,85,0.5)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                {idx === 0 && <span className="absolute top-1 left-1 badge badge-red text-[9px]">Primary</span>}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs flex items-center gap-1.5" style={{ color: '#64748b' }}>
            <ImageOff className="w-3.5 h-3.5" /> No images yet. The first image becomes the cover photo.
          </p>
        )}
      </div>

      {/* Videos / PDFs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="admin-label !mb-0">Videos & Documents</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFiles}
            className="btn-secondary text-xs py-1.5"
          >
            {uploadingFiles ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Add Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.pdf,.doc,.docx"
            multiple
            hidden
            onChange={handleFilesSelected}
          />
        </div>
        {attachments?.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((att, idx) => (
              <div
                key={`${att.url}-${idx}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(51,65,85,0.3)' }}
              >
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm min-w-0"
                  style={{ color: '#e2e8f0' }}
                >
                  {att.type === 'video' ? (
                    <Video className="w-4 h-4 shrink-0" style={{ color: '#60a5fa' }} />
                  ) : (
                    <FileText className="w-4 h-4 shrink-0" style={{ color: '#fb923c' }} />
                  )}
                  <span className="truncate">{att.name || att.url.split('/').pop()}</span>
                </a>
                <button type="button" onClick={() => removeAttachment(idx)} className="btn-danger p-1 shrink-0" title="Remove file">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: '#64748b' }}>No videos or documents attached.</p>
        )}
      </div>
    </div>
  );
}
