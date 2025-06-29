document.addEventListener('DOMContentLoaded', () => {
    // Check if config object exists
    if (typeof config === 'undefined') {
        console.error("File 'config.js' tidak ditemukan atau gagal dimuat.");
        return;
    }
    
    // --- SCRIPT LOGIC ---
    generateProductCards(config.products);
    setupPopup(config.popupSettings);
    lucide.createIcons();
    setupMobileMenu();
    setupCounter();
    setupTestimonialCarousel();
    setupFaq();
});

function generateProductCards(products) {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 ease-in-out relative';
        
        let tagHtml = '';
        if (product.tag && product.tag.text) {
            const tagColor = product.tag.color === 'red' ? 'bg-tag-red' : 'bg-primary';
            tagHtml = `<div class="absolute top-0 right-0 ${tagColor} text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">${product.tag.text}</div>`;
        }
        
        let variantsHtml = product.variants.map(v => 
            `<p class="text-body">Rp <span class="text-xl font-bold text-heading">${v.price}</span> ${v.duration ? `= <span class="font-semibold">${v.duration}</span>` : ''}</p>`
        ).join('');
        
        let availabilityHtml = '';
        if (product.available) {
            availabilityHtml = `
                <div class="flex items-center gap-2 text-green-600 text-sm mb-3"><i data-lucide="check-circle-2" class="w-4 h-4"></i><span>Tersedia</span></div>
                <a href="https://wa.me/6285157014855?text=Halo%20MFSHOP,%20saya%20tertarik%20dengan%20${encodeURIComponent(product.name)}." target="_blank" class="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-accent hover:bg-accent-dark transition-colors">
                    <i data-lucide="shopping-cart" class="w-5 h-5"></i> Pesan via WhatsApp
                </a>`;
        } else {
            availabilityHtml = `
                <div class="flex items-center gap-2 text-red-500 text-sm mb-3"><i data-lucide="x-circle" class="w-4 h-4"></i><span>Stok Habis</span></div>
                <button disabled class="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gray-400 cursor-not-allowed">
                    <i data-lucide="shopping-cart" class="w-5 h-5"></i> Stok Habis
                </button>`;
        }
        
        card.innerHTML = `
            ${tagHtml}
            <div class="p-6">
                <div class="flex items-center gap-4 mb-4">
                    <img src="${product.image}" alt="Logo ${product.name}" class="w-16 h-16 rounded-lg object-contain p-1" onerror="this.src='https://placehold.co/64x64/e0e0e0/757575?text=Img'; this.onerror=null;">
                    <div>
                        <h3 class="text-xl font-bold text-heading">${product.name}</h3>
                        <p class="text-sm text-body">${product.subtitle}</p>
                    </div>
                </div>
                <p class="text-body mb-4 min-h-[6rem]">${product.description}</p>
            </div>
            <div class="p-6 pt-0">
                <div class="bg-light-gray p-3 rounded-lg text-sm mb-4">
                    ${variantsHtml}
                </div>
                ${availabilityHtml}
            </div>`;
        productList.appendChild(card);
    });
}

function setupPopup(settings) {
    const popup = document.getElementById('purchase-popup');
    const popupIconContainer = document.getElementById('popup-icon-container');
    const popupMessage = document.getElementById('popup-message');
    const closePopupBtn = document.getElementById('close-popup-btn');
    if (!popup || !popupIconContainer || !popupMessage || !closePopupBtn || !settings) return;

    const weightedProducts = settings.products.flatMap(p => Array(p.weight || 1).fill(p));
    if (weightedProducts.length === 0) return;

    function censorName(name) {
        if (name.length <= 3) return name.substring(0, 1) + '***';
        return name.substring(0, 2) + '***' + name.substring(name.length - 1);
    }

    function showPurchasePopup() {
        if (settings.names.length === 0 || weightedProducts.length === 0) return;
        const randomName = settings.names[Math.floor(Math.random() * settings.names.length)];
        const randomProductObj = weightedProducts[Math.floor(Math.random() * weightedProducts.length)];
        
        popupMessage.innerHTML = `<span class="font-bold">${censorName(randomName)}</span> baru saja membeli <span class="text-primary font-semibold">${randomProductObj.name}</span>`;
        popupIconContainer.innerHTML = `<img src="${randomProductObj.logo}" alt="${randomProductObj.name} logo" class="w-6 h-6 object-contain rounded-full" onerror="this.src='https://placehold.co/24x24/e0e0e0/757575?text=logo'; this.onerror=null;">`;
        
        popup.classList.remove('hidden', 'animate-slide-out');
        popup.classList.add('animate-slide-in');
        
        setTimeout(() => {
            popup.classList.remove('animate-slide-in');
            popup.classList.add('animate-slide-out');
        }, 15000);
    }

    closePopupBtn.addEventListener('click', () => { 
        popup.classList.add('hidden'); 
        clearInterval(popupInterval);
    });
    
    let popupInterval = setInterval(showPurchasePopup, 30000);
    setTimeout(showPurchasePopup, 5000);
}

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => { mobileMenu.classList.toggle('hidden'); });
    
    document.querySelectorAll('#mobile-menu a, nav a').forEach(link => {
        link.addEventListener('click', (e) => {
           if (link.getAttribute('href').startsWith('#') && !mobileMenu.classList.contains('hidden')) {
               mobileMenu.classList.add('hidden');
           }
        });
    });
}

function setupCounter() {
    const counter = document.getElementById('order-counter');
    if (!counter) return;
    const target = 1500;
    let current = 0;
    const increment = Math.ceil(target / 100);
    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        counter.textContent = current.toLocaleString('id-ID');
    }, 20);
}

function setupTestimonialCarousel() {
    const textTestimonials = [
        { name: "Andi Wijaya", text: "Prosesnya super cepat dan adminnya ramah banget. Langganan di sini gak pernah nyesel!" },
        { name: "Siti Nurhaliza", text: "Awalnya ragu, tapi ternyata amanah banget. Garansinya juga beneran, langsung dibantu pas ada masalah. Top!" },
        { name: "Kevin Sanjaya", text: "Harga paling murah yang pernah saya temuin, kualitasnya tetap premium. Cocok buat kantong mahasiswa kayak saya." },
        { name: "Rizky Amelia", text: "Ini pembelian ketiga saya. Selalu puas sama pelayanannya. Sukses terus MFSHOP!" },
        { name: "Bambang P.", text: "Fitur premiumnya beneran kebuka semua. Sangat membantu pekerjaan saya sebagai konten kreator. Terima kasih!" },
        { name: "Putri Lestari", text: "Nggak perlu nunggu lama, abis transfer langsung diproses. Cepat, aman, dan terpercaya. Bintang 5!" },
        { name: "Agung Hapsah", text: "Rekomendasi dari teman dan emang beneran bagus. Bakal jadi langganan tetap di sini." },
    ];
    
    const textTrack = document.getElementById('text-testimonial-track');
    if (textTrack) {
        textTestimonials.forEach(testimonial => {
            const slide = document.createElement('div');
            slide.className = 'w-full flex-shrink-0 p-2';
            slide.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl p-8 text-center h-full flex flex-col justify-center">
                    <div class="flex justify-center text-yellow-400 mb-4">
                        <i data-lucide="star" class="fill-current"></i><i data-lucide="star" class="fill-current"></i><i data-lucide="star" class="fill-current"></i><i data-lucide="star" class="fill-current"></i><i data-lucide="star" class="fill-current"></i>
                    </div>
                    <p class="text-body italic mb-6">"${testimonial.text}"</p>
                    <p class="font-bold text-heading">- ${testimonial.name}</p>
                </div>
            `;
            textTrack.appendChild(slide);
        });
        setupCarousel('text-testimonial-track', 'text-prev-btn', 'text-next-btn');
    }

    function setupCarousel(trackId, prevBtnId, nextBtnId) {
        const track = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        if (!track || !prevBtn || !nextBtn) return;

        let currentIndex = 0;
        const slides = Array.from(track.children);
        const slideCount = slides.length;
        if (slideCount === 0) return;

        const updateCarousel = () => { track.style.transform = `translateX(-${currentIndex * 100}%)`; };
        nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % slideCount; updateCarousel(); });
        prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + slideCount) % slideCount; updateCarousel(); });
    }
}

function setupFaq() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            if (answer && answer.classList) { answer.classList.toggle('hidden'); }
            if (icon && icon.classList) { icon.classList.toggle('rotate-180'); }
        });
    });
}
