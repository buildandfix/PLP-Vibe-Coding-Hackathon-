

let prices = JSON.parse(localStorage.getItem('prices')) || [];

// Initialize today's date in the date input
document.getElementById('date').value = new Date().toISOString().split('T')[0];

// Populate product filter dropdown
function populateProductFilter() {
    const productFilter = document.getElementById('productFilter');
    const selectedProduct = productFilter.value; // Store currently selected product
    const products = [...new Set(prices.map(p => p.product))].sort(); // Sort for consistency
    productFilter.innerHTML = '<option value="">All Products</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        if (product === selectedProduct) {
            option.selected = true; // Preserve selection
        }
        productFilter.appendChild(option);
    });
}

// Add a new price entry
function addPrice() {
    const product = document.getElementById('productName').value.trim();
    const supplier = document.getElementById('supplierName').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const date = document.getElementById('date').value;

    if (!product || !supplier || isNaN(price) || !date) {
        alert('Please fill in all fields.');
        return;
    }

    prices.push({ product, supplier, price, date });
    localStorage.setItem('prices', JSON.stringify(prices));
    document.getElementById('productName').value = '';
    document.getElementById('supplierName').value = '';
    document.getElementById('price').value = '';
    populateProductFilter();
    displayPrices();
}

// Display prices, optionally filtered by product
function displayPrices() {
    const productFilter = document.getElementById('productFilter').value;
    const priceList = document.getElementById('priceList');
    priceList.innerHTML = '';

    // Filter and group prices by product
    const filteredPrices = productFilter ? prices.filter(p => p.product === productFilter) : prices;
    const groupedByProduct = filteredPrices.reduce((acc, p) => {
        acc[p.product] = acc[p.product] || [];
        acc[p.product].push(p);
        return acc;
    }, {});

    for (const product in groupedByProduct) {
        // Sort prices by date (newest first)
        const productPrices = groupedByProduct[product].sort((a, b) => new Date(b.date) - new Date(a.date));

        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.innerHTML = `<h3>${product}</h3>`;

        // Find the cheapest supplier
        const cheapest = productPrices.reduce((min, p) => !min || p.price < min.price ? p : min, null);

        // Display prices
        productPrices.forEach((p, index) => {
            const priceDiv = document.createElement('div');
            priceDiv.className = 'price-item';
            priceDiv.innerHTML = `
                <span>${p.supplier}: $${p.price.toFixed(2)} (${p.date})${p === cheapest ? ' <span class="cheapest">[Cheapest]</span>' : ''}</span>
                <button onclick="deletePrice(${prices.indexOf(p)})" class="delete-btn">Delete</button>
            `;
            productDiv.appendChild(priceDiv);
        });

        // Add delete product button
        const deleteProductBtn = document.createElement('button');
        deleteProductBtn.className = 'delete-product-btn';
        deleteProductBtn.textContent = `Delete All ${product} Entries`;
        deleteProductBtn.onclick = () => deleteProduct(product);
        productDiv.appendChild(deleteProductBtn);

        priceList.appendChild(productDiv);
    }
}

// Delete a single price entry
function deletePrice(index) {
    if (confirm('Delete this price entry?')) {
        prices.splice(index, 1);
        localStorage.setItem('prices', JSON.stringify(prices));
        populateProductFilter();
        displayPrices();
    }
}

// Delete all entries for a product
function deleteProduct(product) {
    if (confirm(`Delete all entries for ${product}?`)) {
        prices = prices.filter(p => p.product !== product);
        localStorage.setItem('prices', JSON.stringify(prices));
        populateProductFilter();
        displayPrices();
    }
}

// Initial setup
populateProductFilter();
displayPrices();