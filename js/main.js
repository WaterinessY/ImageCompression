// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片数据
let currentFile = null;
let compressedBlob = null;

// 初始化拖放区域事件
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 处理拖放和点击上传
dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// 处理拖放文件
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// 处理文件
async function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    displayFileSize(file.size, originalSize);
    
    // 显示原图预览
    originalPreview.src = URL.createObjectURL(file);
    previewSection.style.display = 'block';
    
    // 压缩图片
    await compressImage();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 显示文件大小
function displayFileSize(bytes, element) {
    element.textContent = formatFileSize(bytes);
}

// 压缩图片
async function compressImage() {
    if (!currentFile) return;

    const quality = qualitySlider.value / 100;
    const options = {
        maxSizeMB: Math.max(1, currentFile.size / (1024 * 1024)),
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality,
    };

    try {
        if (compressedPreview.src) {
            URL.revokeObjectURL(compressedPreview.src);
        }

        compressedBlob = await imageCompression(currentFile, options);
        const compressedUrl = URL.createObjectURL(compressedBlob);
        compressedPreview.src = compressedUrl;
        displayFileSize(compressedBlob.size, compressedSize);
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 监听质量滑块变化
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value + '%';
    compressImage();
});

// 下载压缩后的图片
downloadBtn.addEventListener('click', () => {
    if (!compressedBlob) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    
    // 生成文件名
    const extension = currentFile.name.split('.').pop();
    const filename = `compressed_${Date.now()}.${extension}`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}); 