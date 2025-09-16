"use strict"

const productsArea = document.querySelector(".products");
const cartEmpty = document.querySelector(".cart-empty");
const cartNotEmpty = document.querySelector(".cart-with-products");
const cartTotalPrice = document.querySelector(".cart-total-price p:nth-child(2)");
const cartProductsCounter = document.querySelector(".cart-checkout h2 span");
const confirmOrderBtn = document.querySelector(".cart-total button")
const modal = document.querySelector(".order-confirmed-modal");
const overlay = document.querySelector(".overlay");
const orderConfirmedProductsArea = document.querySelector('.order-confirmed-products');
const newOrderBtn = document.querySelector(".new-order-btn");

// Getting the products from the json file
const GetProducts = async function(url){
    try{
        const response = await fetch(url);
        if(!response.ok) throw new Error("Data Not Found");
        const data = await response.json();
        return data;
    }catch(e){
        console.error(`❌ ERROR HAPPENED ${e.message}`);
    }
}

// products is the array of all products
// const jsonURL = URL.createObjectURL("../data.json")
// console.log(jsonURL)
const products = await GetProducts("Product-list-with-cart/data.json");
const productsInCart = [];

// rendering the products
const renderProducts = function(products){
    products.forEach(product => {
        const html = `
        <div class="product" data-name="${product.name}">
            <div class="product-img">
                <img src="${product.image.desktop}" alt="">
            </div><!-- product-img -->
            
            <div class="product-quantity-btn">
                <div class="product-quantity-area">
                    <button class="add-to-cart-btn btn "><span><img src="assets/images/icon-add-to-cart.svg" alt="add to cart"></span>Add to Cart</button>
                    
                    <div class="product-quantity hidden">
                    <div class="minus center">
                        <i class="fa-solid fa-minus"></i>
                    </div>
                    <span data-quantity="1">1</span>
                    <div class="plus center">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    </div><!-- product-quantity -->

                </div><!-- product-quantity-area -->
            </div><!-- product-quantity-btn -->
        
            <div class="product-info">
                <p>${product.category}</p>
                <p>${product.name}</p>
                <p>${product.price}</p>
            </div><!-- product-info -->
        </div><!-- product -->
        `
        // inserting the product in the products area
        productsArea.insertAdjacentHTML("beforeend" , html);
    });
}
renderProducts(products);

const addProductToCart = function(product , quantity){
    renderProductInCart(product , quantity);
    productsInCart.push({
        name: product.name,
        price: product.price,
        quantity: quantity,
        totalPrice: product.price * quantity,
        imageURL: product.image.thumbnail,
    })
}

const renderProductInCart = function(product){
    const html = `
        <div class="cart-product" data-name="${product.name}">
          <div class="product-info-cart">
            <p>${product.name}</p>
            <div>
              <p class="product-quantity-number">1x</p>
              <p class="product-price">@$${product.price}</p>
              <p class="product-total">$${product.price}</p>
            </div><!-- product quantity calculations -->
          </div><!-- product-info -->

          <div class="delete-product center">
            <i class="fa-solid fa-x"></i>
          </div>
        </div><!-- cart-product -->
    `
    cartNotEmpty.insertAdjacentHTML("afterbegin" , html);
}


const updateProductInCart = function(productName, newQuantity) {
  // 1. Update array
  const item = productsInCart.find(p => p.name === productName);
  if (!item) return;

  item.quantity = newQuantity;
  item.totalPrice = item.price * newQuantity;

  // 2. Update cart DOM
  const cartProduct = cartNotEmpty.querySelector(
    `.cart-product[data-name="${productName}"]`
  );

  if (cartProduct) {
    cartProduct.querySelector(".product-quantity-number").textContent = `${newQuantity}x`;
    cartProduct.querySelector(".product-total").textContent = `$${item.totalPrice.toFixed(2)}`;
  }
};

const removeProductFromCart = function(cartProduct){
    const productName = cartProduct.dataset.name;

    // 1. Remove from array properly
    const index = productsInCart.findIndex(p => p.name === productName);
    if (index > -1) {
        productsInCart.splice(index, 1);
    }

    // 2. Remove from cart DOM
    cartProduct.remove();

    // 3. Update total price
    updateTotalPrice();

    // 4. update the cart products counter
    updateCartProductsCounter();

    // 5. Toggle cart back to empty if all products removed
    if (productsInCart.length === 0) {
        cartNotEmpty.classList.add("removed");
        cartEmpty.classList.remove("removed");
    }

    // 6. Reset the product card (show Add to Cart again)
    const productCard = productsArea.querySelector(`.product[data-name="${productName}"]`);
    if (productCard) {
        const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
        const productQuantity = productCard.querySelector(".product-quantity");
        const quantity = productCard.querySelector(".product-quantity span");

        // Reset UI
        addToCartBtn.classList.remove("hidden");
        productQuantity.classList.add("hidden");
        quantity.dataset.quantity = 1;
        quantity.textContent = 1;
    }
};


const updateTotalPrice = function(){
    let totalPrice = 0;
    productsInCart.forEach(pro => {
        totalPrice += pro.totalPrice;
    })
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
}

const updateCartProductsCounter = function(){
    cartProductsCounter.textContent = productsInCart.length;
}

const renderProductsInModal = function(products){

    // Clear old modal content
    orderConfirmedProductsArea.innerHTML = `
        <div class="order-confirmed-total">
          <p>order total</p>
          <p></p>
        </div>
    `

    products.forEach(product =>{
        const html = `
        <div class="order-confirmed-product">
         <div class="order-confirmed-product-img-info">
          <div>
            <img src="${product.imageURL}" alt="${product.name}">
            <div class="confirmed-product-info">
              <p>${product.name}</p>
              <div>
                <p>${product.quantity}</p>
                <p>@$${product.price}</p>
              </div>
            </div><!-- confirmed-product-info -->
          </div>
          <div class="confirmed-product-total-price">
            <p>$${product.totalPrice}</p>
          </div><!-- confirmed-product-total-price -->
         </div><!-- order-confirmed-product-img-info -->
        </div><!-- order-confirmed-product -->
    `

    orderConfirmedProductsArea.insertAdjacentHTML("afterbegin" , html);
    })

    // showing total price
    
    const modalTotalPrice = document.querySelector(".order-confirmed-total p:nth-child(2)")
    modalTotalPrice.textContent = cartTotalPrice.textContent;
}


productsArea.addEventListener("click" , function(e){

    const quantityArea = e.target.closest(".product-quantity-area");

    if(quantityArea){
        const product = quantityArea.closest(".product");
        const productName = product.dataset.name;
        const productItem = products.find(pro => pro.name === productName);
        const addToCartBtn = product.querySelector(".add-to-cart-btn");
        const productQuantity = product.querySelector(".product-quantity");
        const quantity = product.querySelector(".product-quantity span");
        let currentQuantity = +quantity.dataset.quantity;

        // product Item not added to cart
        if(productQuantity.classList.contains("hidden")){
            // showing the quantity part on the product
            addToCartBtn.classList.add("hidden");
            productQuantity.classList.remove("hidden");

            // hiding the empty cart and showing the cart with products
            cartNotEmpty.classList.remove("removed");
            cartEmpty.classList.add("removed");
            
            // adding this product to the cart
            addProductToCart(productItem , 1);
            updateTotalPrice();

            // update the cart products counter
            updateCartProductsCounter();
        }

        if(e.target.closest(".plus")){
            // changing the amount in the product itself
            currentQuantity++;
            quantity.dataset.quantity = currentQuantity;
            quantity.textContent = currentQuantity;

            // changing the amount in the cart and doing the calculations
            updateProductInCart(productName, currentQuantity);
            updateTotalPrice();
        }

        if(e.target.closest(".minus")){
            if(currentQuantity > 1){
                // changing the amount in the product itself
                currentQuantity--;
                quantity.dataset.quantity = currentQuantity;
                quantity.textContent = currentQuantity;
            }

            // changing the amount in the cart and doing the calculations
            updateProductInCart(productName, currentQuantity);
            updateTotalPrice();
        }
    }
})

cartNotEmpty.addEventListener("click" , function(e){
    const product = e.target.closest(".cart-product");

    if(e.target.closest(".delete-product")){
        removeProductFromCart(product);
    }
})

confirmOrderBtn.addEventListener("click" , function(e){
    e.preventDefault();
    document.body.style.backgroundColor = "rgba(255, 255, 255, 0.38)";
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");

    // rendering the products in the modal
    renderProductsInModal(productsInCart); 

    // put this in your notes later
    // overlay.setAttribute("tabindex", "-1"); // make it focusable
    // overlay.focus(); // give it focus when opened       
})

const hideModal = function(){
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
}

const resetPage = function(){
    location.reload();
}

// hiding modal when clicking on overlay
overlay.addEventListener("click", hideModal);

// hiding modal when clicking on escape button
document.addEventListener("keydown" , function(e){
    if(e.key == "Escape") hideModal();
})

newOrderBtn.addEventListener("click" , resetPage);