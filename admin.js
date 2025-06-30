// --- !! PENTING !! ---
// Ganti password di bawah ini dengan password rahasia Anda.
const correctPassword = "mfshop-admin-rahasia";
// --- !! PENTING !! ---

document.addEventListener('DOMContentLoaded', () => {
    // Check if config object exists
    if (typeof config === 'undefined') {
        alert("File 'config.js' tidak ditemukan. Pastikan file tersebut ada dan dapat diakses.");
        return;
    }

    // Initialize Lucide Icons
    lucide.createIcons();

    // --- State Management ---
    let currentConfig = JSON.parse(JSON.stringify(config));

    // --- DOM Elements ---
    const passwordPrompt = document.getElementById('password-prompt');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    const adminPanel = document.getElementById('admin-panel');
    
    const adminProductList = document.getElementById('admin-product-list');
    const addProductBtn = document.getElementById('add-product-btn');
    
    const productModal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const productForm = document.getElementById('product-form');
    const cancelProductFormBtn = document.getElementById('cancel-product-form');
    const addVariantBtn = document.getElementById('add-variant-btn');

    const popupNamesTextarea = document.getElementById('popup-names');
    const popupProductList = document.getElementById('popup-product-list');
    const addPopupProductBtn = document.getElementById('add-popup-product-btn');
    const saveAndDownloadBtn = document.getElementById('save-and-download');

    // --- Password Protection ---
    passwordSubmit.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    function handleLogin() {
        if (passwordInput.value === correctPassword) {
            passwordPrompt.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            initializeApp();
        } else {
            passwordError.classList.remove('hidden');
        }
    }

    // --- Initialization ---
    function initializeApp() {
        renderProductList();
        renderPopupSettings();
        setupEventListeners();
        initSortable();
    }
    
    // --- Drag & Drop Initialization ---
    function initSortable() {
        new Sortable(adminProductList, {
            handle: '.drag-handle', // Elemen yang menjadi 'pegangan'
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: function (evt) {
                // Pindahkan item dalam array sesuai urutan baru
                const movedItem = currentConfig.products.splice(evt.oldIndex, 1)[0];
                currentConfig.products.splice(evt.newIndex, 0, movedItem);
                
                // Render ulang list untuk memperbarui 'data-index' pada tombol
                renderProductList();
            },
        });
    }

    // --- Rendering Functions ---
    function renderProductList() {
        adminProductList.innerHTML = '';
        currentConfig.products.forEach((product, index) => {
            const productWrapper = document.createElement('div');
            // [DIUBAH] Struktur HTML baru untuk item produk
            // Menggunakan flexbox untuk menempatkan pegangan di sebelah kiri
            productWrapper.className = 'flex items-center gap-3 product-item';
            productWrapper.dataset.id = product.id; 
            
            productWrapper.innerHTML = `
                <!-- Pegangan Drag & Drop di Kiri -->
                <div class="drag-handle cursor-move p-2 text-gray-400 hover:text-gray-600">
                    <i data-lucide="grip-vertical" class="w-6 h-6 pointer-events-none"></i>
                </div>
                <!-- Konten Produk -->
                <div class="flex-grow flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div class="flex items-center gap-4">
                        <img src="${product.image}" alt="${product.name}" class="w-12 h-12 rounded-md object-contain" onerror="this.src='https://placehold.co/48x48/e0e0e0/757575?text=Img';">
                        <div>
                            <p class="font-bold text-lg text-gray-800">${product.name}</p>
                            <p class="text-sm text-gray-500">${product.subtitle}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button data-index="${index}" class="edit-btn bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"><i data-lucide="edit" class="w-4 h-4 pointer-events-none"></i></button>
                        <button data-index="${index}" class="delete-btn bg-red-600 text-white p-2 rounded-md hover:bg-red-700"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                    </div>
                </div>
            `;
            adminProductList.appendChild(productWrapper);
        });
        lucide.createIcons(); // Render ulang semua ikon lucide
    }
    
    function renderPopupSettings() {
        popupNamesTextarea.value = currentConfig.popupSettings.names.join(', ');
        popupProductList.innerHTML = '';
        currentConfig.popupSettings.products.forEach((p, index) => {
            addPopupProductRow(p.name, p.logo, p.weight, index);
        });
    }
    
    function addPopupProductRow(name = '', logo = '', weight = 1, index) {
        const row = document.createElement('div');
        row.className = 'grid grid-cols-12 gap-2 items-center mb-2 popup-product-row';
        row.innerHTML = `
            <input type="text" value="${name}" placeholder="Nama Produk" class="col-span-4 p-2 border rounded-md popup-product-name">
            <input type="text" value="${logo}" placeholder="URL Logo" class="col-span-5 p-2 border rounded-md popup-product-logo">
            <input type="number" value="${weight}" min="1" class="col-span-2 p-2 border rounded-md popup-product-weight">
            <button type="button" data-index="${index}" class="col-span-1 text-red-500 hover:text-red-700 remove-popup-product-btn"><i data-lucide="x-circle" class="w-5 h-5 mx-auto pointer-events-none"></i></button>
        `;
        popupProductList.appendChild(row);
        lucide.createIcons();
    }
    
    // --- Event Listeners Setup ---
    function setupEventListeners() {
        addProductBtn.addEventListener('click', handleAddProduct);
        adminProductList.addEventListener('click', handleProductListActions);
        
        productForm.addEventListener('submit', handleFormSubmit);
        cancelProductFormBtn.addEventListener('click', closeProductModal);
        addVariantBtn.addEventListener('click', () => addVariantRow());

        addPopupProductBtn.addEventListener('click', () => addPopupProductRow());
        popupProductList.addEventListener('click', (e) => {
            if (e.target.closest('.remove-popup-product-btn')) {
                e.target.closest('.popup-product-row').remove();
            }
        });
        
        saveAndDownloadBtn.addEventListener('click', handleSaveAndDownload);
    }
    
    // --- Handlers ---
    function handleAddProduct() {
        openProductModal();
    }
    
    function handleProductListActions(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const index = button.dataset.index;

        if (button.classList.contains('edit-btn')) {
            openProductModal(currentConfig.products[index], index);
        } else if (button.classList.contains('delete-btn')) {
            if (confirm(`Anda yakin ingin menghapus produk "${currentConfig.products[index].name}"?`)) {
                currentConfig.products.splice(index, 1);
                renderProductList();
            }
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const productName = document.getElementById('product-name').value;
        const newProductData = {
            id: id || productName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
            name: productName,
            subtitle: document.getElementById('product-subtitle').value,
            description: document.getElementById('product-description').value,
            image: document.getElementById('product-image').value,
            tag: {
                text: document.getElementById('product-tag-text').value,
                color: document.getElementById('product-tag-color').value
            },
            available: document.getElementById('product-available').value === 'true',
            variants: []
        };
        if (!newProductData.tag.text) {
            newProductData.tag = null;
        }

        document.querySelectorAll('.variant-row').forEach(row => {
            const price = row.querySelector('.variant-price').value;
            const duration = row.querySelector('.variant-duration').value;
            if (price) {
                newProductData.variants.push({ price, duration: duration || null });
            }
        });

        if (id) {
            const index = currentConfig.products.findIndex(p => p.id === id);
            currentConfig.products[index] = newProductData;
        } else {
            currentConfig.products.push(newProductData);
        }
        
        renderProductList();
        closeProductModal();
    }

    function handleSaveAndDownload() {
        currentConfig.popupSettings.names = popupNamesTextarea.value.split(',').map(name => name.trim()).filter(name => name);
        
        const newPopupProducts = [];
        document.querySelectorAll('.popup-product-row').forEach(row => {
            const name = row.querySelector('.popup-product-name').value;
            const logo = row.querySelector('.popup-product-logo').value;
            const weight = parseInt(row.querySelector('.popup-product-weight').value, 10) || 1;
            if (name) {
                newPopupProducts.push({ name, logo, weight });
            }
        });
        currentConfig.popupSettings.products = newPopupProducts;
        
        const fileContent = `const config = ${JSON.stringify(currentConfig, null, 2)};`;
        
        const blob = new Blob([fileContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('File "config.js" telah diunduh! Silakan unggah file ini ke hosting Anda untuk menerapkan perubahan.');
    }

    // --- Modal & Form Functions ---
    function openProductModal(product = null, index = null) {
        productForm.reset();
        document.getElementById('product-variants-container').innerHTML = '<label class="block text-sm font-medium text-gray-700 mb-2">Varian Harga & Durasi</label>';

        if (product) {
            modalTitle.textContent = 'Edit Produk';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-subtitle').value = product.subtitle;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-tag-text').value = product.tag ? product.tag.text : '';
            document.getElementById('product-tag-color').value = product.tag ? product.tag.color : 'blue';
            document.getElementById('product-available').value = String(product.available);
            product.variants.forEach(v => addVariantRow(v.price, v.duration));
        } else {
            modalTitle.textContent = 'Tambah Produk Baru';
            document.getElementById('product-id').value = '';
            addVariantRow();
        }
        productModal.classList.remove('hidden');
    }
    
    function closeProductModal() {
        productModal.classList.add('hidden');
    }
    
    function addVariantRow(price = '', duration = '') {
        const container = document.getElementById('product-variants-container');
        const variantRow = document.createElement('div');
        variantRow.className = 'variant-row grid grid-cols-12 gap-2 mb-2';
        variantRow.innerHTML = `
            <input type="text" class="variant-price col-span-5 px-3 py-2 border rounded-md" placeholder="Harga (cth: 10.000)" value="${price}">
            <input type="text" class="variant-duration col-span-6 px-3 py-2 border rounded-md" placeholder="Durasi (cth: 1 Bulan)" value="${duration || ''}">
            <button type="button" class="remove-variant-btn col-span-1 text-red-500 hover:text-red-700"><i data-lucide="x-circle" class="w-5 h-5 mx-auto pointer-events-none"></i></button>
        `;
        container.appendChild(variantRow);
        variantRow.querySelector('.remove-variant-btn').addEventListener('click', () => variantRow.remove());
        lucide.createIcons();
    }
});
