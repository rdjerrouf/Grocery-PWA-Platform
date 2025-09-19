<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>سوبرماركت الجزائر - Supermarché Algérie</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #333;
            line-height: 1.6;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: bold;
        }

        .search-bar {
            flex: 1;
            max-width: 500px;
            position: relative;
        }

        .search-input {
            width: 100%;
            padding: 0.75rem 3rem 0.75rem 1rem;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            outline: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .search-btn {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .search-btn:hover {
            transform: translateY(-50%) scale(1.1);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .lang-toggle {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .lang-toggle:hover {
            background: rgba(255,255,255,0.3);
        }

        .cart-btn {
            position: relative;
            background: linear-gradient(135deg, #10B981, #059669);
            border: none;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .cart-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
        }

        .cart-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #EF4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Categories */
        .categories {
            background: white;
            padding: 1rem 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .categories-scroll {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            padding-bottom: 0.5rem;
        }

        .category-item {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border-radius: 15px;
            transition: all 0.3s ease;
            cursor: pointer;
            min-width: 100px;
        }

        .category-item:hover {
            background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
            transform: translateY(-5px);
        }

        .category-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .category-name {
            font-size: 0.9rem;
            font-weight: 500;
            text-align: center;
        }

        /* Main Content */
        .main-content {
            padding: 2rem 0;
        }

        .section-title {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: #1F2937;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -5px;
            right: 0;
            width: 50px;
            height: 3px;
            background: linear-gradient(135deg, #10B981, #059669);
            border-radius: 2px;
        }

        /* Product Grid */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }

        .product-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            position: relative;
        }

        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .product-image {
            position: relative;
            height: 200px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: all 0.3s ease;
        }

        .product-card:hover .product-image img {
            transform: scale(1.1);
        }

        .discount-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: linear-gradient(135deg, #EF4444, #DC2626);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .favorite-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.9);
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .favorite-btn:hover {
            background: #EF4444;
            color: white;
            transform: scale(1.1);
        }

        .product-info {
            padding: 1.5rem;
        }

        .product-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #1F2937;
            line-height: 1.4;
        }

        .product-description {
            color: #6B7280;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            line-height: 1.4;
        }

        .product-price {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .current-price {
            font-size: 1.3rem;
            font-weight: bold;
            color: #10B981;
        }

        .original-price {
            font-size: 0.9rem;
            color: #9CA3AF;
            text-decoration: line-through;
        }

        .add-to-cart {
            width: 100%;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .add-to-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
        }

        .quantity-control {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #F3F4F6;
            border-radius: 15px;
            padding: 0.5rem;
        }

        .quantity-btn {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .quantity-btn:hover {
            transform: scale(1.1);
        }

        .quantity-value {
            font-weight: 600;
            font-size: 1.1rem;
        }

        /* Quick Actions */
        .quick-actions {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .action-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 15px;
            transition: all 0.3s ease;
            cursor: pointer;
            background: linear-gradient(135deg, #F9FAFB, #F3F4F6);
        }

        .action-item:hover {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            transform: translateY(-5px);
        }

        .action-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
        }

        .action-item:hover .action-icon {
            background: rgba(255,255,255,0.2);
        }

        /* Footer */
        .footer {
            background: #1F2937;
            color: white;
            padding: 3rem 0 1rem;
            margin-top: 3rem;
        }

        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .footer-section h3 {
            margin-bottom: 1rem;
            color: #10B981;
        }

        .footer-section ul {
            list-style: none;
        }

        .footer-section li {
            margin-bottom: 0.5rem;
        }

        .footer-section a {
            color: #D1D5DB;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .footer-section a:hover {
            color: #10B981;
        }

        .footer-bottom {
            border-top: 1px solid #374151;
            padding-top: 1rem;
            text-align: center;
            color: #9CA3AF;
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }

            .search-bar {
                order: 3;
                width: 100%;
            }

            .products-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 1rem;
            }

            .categories-scroll {
                gap: 0.5rem;
            }

            .category-item {
                min-width: 80px;
                padding: 0.5rem;
            }

            .category-icon {
                width: 40px;
                height: 40px;
                font-size: 1.2rem;
            }

            .actions-grid {
                grid-template-columns: 1fr;
            }
        }

        /* PWA Install Banner */
        .install-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 15px;
            margin: 1rem 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .install-text {
            flex: 1;
        }

        .install-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .install-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }

        /* Animation Classes */
        .fade-in {
            animation: fadeIn 0.6s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .bounce {
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        /* Offline Indicator */
        .offline-banner {
            background: #F59E0B;
            color: white;
            padding: 0.5rem;
            text-align: center;
            font-weight: 600;
            display: none;
        }

        .offline-banner.show {
            display: block;
        }
    </style>
</head>
<body>
    <!-- Offline Banner -->
    <div class="offline-banner" id="offlineBanner">
        <i class="fas fa-wifi-slash"></i> أنت في وضع عدم الاتصال - بعض الميزات قد لا تعمل
    </div>

    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-shopping-basket"></i>
                    <span>سوبرماركت الجزائر</span>
                </div>
                
                <div class="search-bar">
                    <input type="text" class="search-input" placeholder="ابحث عن منتجات...">
                    <button class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                
                <div class="header-actions">
                    <button class="lang-toggle" onclick="toggleLanguage()">
                        <i class="fas fa-globe"></i> FR
                    </button>
                    
                    <button class="cart-btn" onclick="toggleCart()">
                        <i class="fas fa-shopping-cart"></i>
                        <span>السلة</span>
                        <span class="cart-badge">3</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- PWA Install Banner -->
    <div class="container">
        <div class="install-banner" id="installBanner" style="display: none;">
            <div class="install-text">
                <strong>قم بتثبيت التطبيق!</strong><br>
                احصل على تجربة أفضل مع تطبيقنا المحمول
            </div>
            <button class="install-btn" onclick="installPWA()">
                <i class="fas fa-download"></i> تثبيت
            </button>
        </div>
    </div>

    <!-- Categories -->
    <section class="categories">
        <div class="container">
            <div class="categories-scroll">
                <div class="category-item" onclick="filterByCategory('fruits')">
                    <div class="category-icon">
                        <i class="fas fa-apple-alt"></i>
                    </div>
                    <div class="category-name">فواكه وخضروات</div>
                </div>
                
                <div class="category-item" onclick="filterByCategory('dairy')">
                    <div class="category-icon">
                        <i class="fas fa-cheese"></i>
                    </div>
                    <div class="category-name">ألبان وأجبان</div>
                </div>
                
                <div class="category-item" onclick="filterByCategory('meat')">
                    <div class="category-icon">
                        <i class="fas fa-drumstick-bite"></i>
                    </div>
                    <div class="category-name">لحوم ودجاج</div>
                </div>
                
                <div class="category-item" onclick="filterByCategory('bakery')">
                    <div class="category-icon">
                        <i class="fas fa-bread-slice"></i>
                    </div>
                    <div class="category-name">مخبوزات</div>
                </div>
                
                <div class="category-item" onclick="filterByCategory('beverages')">
                    <div class="category-icon">
                        <i class="fas fa-coffee"></i>
                    </div>
                    <div class="category-name">مشروبات</div>
                </div>
                
                <div class="category-item" onclick="filterByCategory('snacks')">
                    <div class="category-icon">
                        <i class="fas fa-cookie-bite"></i>
                    </div>
                    <div class="category-name">وجبات خفيفة</div>
                </div>
                
                <div class="category-item" onclick="filterByCategory('cleaning')">
                    <div class="category-icon">
                        <i class="fas fa-spray-can"></i>
                    </div>
                    <div class="category-name">مواد تنظيف</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <!-- Featured Products -->
            <section class="fade-in">
                <h2 class="section-title">المنتجات المميزة</h2>
                <div class="products-grid" id="productsGrid">
                    <!-- Product 1 -->
                    <div class="product-card">
                        <div class="product-image">
                            <div class="discount-badge">خصم 15%</div>
                            <button class="favorite-btn">
                                <i class="far fa-heart"></i>
                            </button>
                            <div style="background: linear-gradient(45deg, #FFE4E1, #FFA07A); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                                🍎
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">تفاح أحمر طازج</h3>
                            <p class="product-description">تفاح أحمر طبيعي عضوي من المزارع المحلية</p>
                            <div class="product-price">
                                <span class="current-price">320 د.ج</span>
                                <span class="original-price">380 د.ج</span>
                            </div>
                            <button class="add-to-cart" onclick="addToCart(1)">
                                <i class="fas fa-plus"></i>
                                أضف للسلة
                            </button>
                        </div>
                    </div>

                    <!-- Product 2 -->
                    <div class="product-card">
                        <div class="product-image">
                            <button class="favorite-btn">
                                <i class="far fa-heart"></i>
                            </button>
                            <div style="background: linear-gradient(45deg, #F0F8FF, #E6F3FF); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                                🥛
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">حليب طازج كامل الدسم</h3>
                            <p class="product-description">حليب طبيعي 100% من أبقار محلية - 1 لتر</p>
                            <div class="product-price">
                                <span class="current-price">180 د.ج</span>
                            </div>
                            <div class="quantity-control" style="display: none;" id="quantity-2">
                                <button class="quantity-btn" onclick="decreaseQuantity(2)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity-value" id="qty-2">1</span>
                                <button class="quantity-btn" onclick="increaseQuantity(2)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="add-to-cart" onclick="addToCart(2)" id="addBtn-2">
                                <i class="fas fa-plus"></i>
                                أضف للسلة
                            </button>
                        </div>
                    </div>

                    <!-- Product 3 -->
                    <div class="product-card">
                        <div class="product-image">
                            <div class="discount-badge">خصم 25%</div>
                            <button class="favorite-btn">
                                <i class="far fa-heart"></i>
                            </button>
                            <div style="background: linear-gradient(45deg, #FFF8DC, #F0E68C); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                                🍞
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">خبز طازج محلي</h3>
                            <p class="product-description">خبز طازج مخبوز يومياً بأجود أنواع الدقيق</p>
                            <div class="product-price">
                                <span class="current-price">45 د.ج</span>
                                <span class="original-price">60 د.ج</span>
                            </div>
                            <button class="add-to-cart" onclick="addToCart(3)">
                                <i class="fas fa-plus"></i>
                                أضف للسلة
                            </button>
                        </div>
                    </div>

                    <!-- Product 4 -->
                    <div class="product-card">
                        <div class="product-image">
                            <button class="favorite-btn">
                                <i class="far fa-heart"></i>
                            </button>
                            <div style="background: linear-gradient(45deg, #FFE4B5, #DEB887); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                                🍗
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">دجاج طازج محلي</h3>
                            <p class="product-description">دجاج طازج من مزارع محلية - 1 كيلو</p>
                            <div class="product-price">
                                <span class="current-price">850 د.ج</span>
                            </div>
                            <button class="add-to-cart" onclick="addToCart(4)">
                                <i class="fas fa-plus"></i>
                                أضف للسلة
                            </button>
                        </div>
                    </div>

                    <!-- Product 5 -->
                    <div class="product-card">
                        <div class="product-image">
                            <div class="discount-badge">جديد</div>
                            <button class="favorite-btn">
                                <i class="far fa-heart"></i>
                            </button>
                            <div style="background: linear-gradient(45deg, #E0FFE0, #C0FFC0); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                                🥬
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">خس طازج عضوي</h3>
                            <p class="product-description">خس طازج عضوي من الحدائق المحلية</p>
                            <div class="product-price">
                                <span class="current-price">120 د.ج</span>
                            </div>
                            <button class="add-to-cart" onclick="addToCart(5)">
                                <i class="fas fa-plus"></i>
                                أضف للسلة
                            </button>
                        </div>
                    </div>

                    <!-- Product 6 -->
                    <div class="product-card">
                        <div class="product-image">
                            <button class="favorite-btn">
                                <i class="far fa-heart"></i>
                            </button>
                            <div style="background: linear-gradient(45deg, #FFE4E1, #FFC0CB); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                                🧀
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">جبن كامامبير فرنسي</h3>
                            <p class="product-description">جبن كامامبير أصلي مستورد من فرنسا</p>
                            <div class="product-price">
                                <span class="current-price">1200 د.ج</span>
                            </div>
                            <button class="add-to-cart" onclick="addToCart(6)">
                                <i class="fas fa-plus"></i>
                                أضف للسلة
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Quick Actions -->
            <section class="quick-actions fade-in">
                <h2 class="section-title">خدمات سريعة</h2>
                <div class="actions-grid">
                    <div class="action-item" onclick="showDeliveryInfo()">
                        <div class="action-icon">
                            <i class="fas fa-truck"></i>
                        </div>
                        <div>
                            <h4>توصيل سريع</h4>
                            <p>توصيل مجاني للطلبات أكثر من 1000 د.ج</p>
                        </div>
                    </div>
                    
                    <div class="action-item" onclick="showOffers()">
                        <div class="action-icon">
                            <i class="fas fa-tags"></i>
                        </div>
                        <div>
                            <h4>عروض اليوم</h4>
                            <p>خصومات حصرية وعروض محدودة</p>
                        </div>
                    </div>
                    
                    <div class="action-item" onclick="showOrders()">
                        <div class="action-icon">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <div>
                            <h4>طلباتي</h4>
                            <p>تتبع حالة طلباتك السابقة</p>
                        </div>
                    </div>
                    
                    <div class="action-item" onclick="showSupport()">
                        <div class="action-icon">
                            <i class="fas fa-headset"></i>
                        </div>
                        <div>
                            <h4>خدمة العملاء</h4>
                            <p>نحن هنا لمساعدتك على مدار الساعة</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>عن سوبرماركت الجزائر</h3>
                    <p>نحن نقدم أجود المنتجات الطازجة والمحلية مع خدمة توصيل سريعة وموثوقة في جميع أنحاء الجزائر.</p>
                    <div style="margin-top: 1rem;">
                        <a href="#" style="margin-left: 1rem;"><i class="fab fa-facebook"></i></a>
                        <a href="#" style="margin-left: 1rem;"><i class="fab fa-instagram"></i></a>
                        <a href="#" style="margin-left: 1rem;"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h3>روابط سريعة</h3>
                    <ul>
                        <li><a href="#">الصفحة الرئيسية</a></li>
                        <li><a href="#">عن الشركة</a></li>
                        <li><a href="#">العروض</a></li>
                        <li><a href="#">المدونة</a></li>
                        <li><a href="#">اتصل بنا</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>خدمة العملاء</h3>
                    <ul>
                        <li><a href="#">مركز المساعدة</a></li>
                        <li><a href="#">سياسة الإرجاع</a></li>
                        <li><a href="#">طرق الدفع</a></li>
                        <li><a href="#">الشحن والتوصيل</a></li>
                        <li><a href="#">الأسئلة الشائعة</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h3>معلومات التواصل</h3>
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <i class="fas fa-phone" style="margin-left: 0.5rem; color: #10B981;"></i>
                        <span>+213 555 123 456</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <i class="fas fa-envelope" style="margin-left: 0.5rem; color: #10B981;"></i>
                        <span>info@supermarket-dz.com</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <i class="fas fa-map-marker-alt" style="margin-left: 0.5rem; color: #10B981;"></i>
                        <span>الجزائر العاصمة، الجزائر</span>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 سوبرماركت الجزائر. جميع الحقوق محفوظة. | <a href="#" style="color: #10B981;">شروط الاستخدام</a> | <a href="#" style="color: #10B981;">سياسة الخصوصية</a></p>
            </div>
        </div>
    </footer>

    <script>
        // PWA functionality
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            document.getElementById('installBanner').style.display = 'flex';
        });

        function installPWA() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        document.getElementById('installBanner').style.display = 'none';
                    }
                    deferredPrompt = null;
                });
            }
        }

        // Offline detection
        window.addEventListener('online', () => {
            document.getElementById('offlineBanner').classList.remove('show');
        });

        window.addEventListener('offline', () => {
            document.getElementById('offlineBanner').classList.add('show');
        });

        // Shopping cart functionality
        let cartItems = [];
        let cartCount = 0;

        function addToCart(productId) {
            cartItems.push(productId);
            cartCount++;
            updateCartBadge();
            
            // Show quantity controls for this product
            const quantityControl = document.getElementById(`quantity-${productId}`);
            const addButton = document.getElementById(`addBtn-${productId}`);
            
            if (quantityControl && addButton) {
                quantityControl.style.display = 'flex';
                addButton.style.display = 'none';
            }
            
            // Show success animation
            showToast('تم إضافة المنتج للسلة!', 'success');
        }

        function updateCartBadge() {
            document.querySelector('.cart-badge').textContent = cartCount;
            if (cartCount > 0) {
                document.querySelector('.cart-badge').style.display = 'flex';
            }
        }

        function increaseQuantity(productId) {
            const qtyElement = document.getElementById(`qty-${productId}`);
            let currentQty = parseInt(qtyElement.textContent);
            qtyElement.textContent = currentQty + 1;
            cartCount++;
            updateCartBadge();
        }

        function decreaseQuantity(productId) {
            const qtyElement = document.getElementById(`qty-${productId}`);
            let currentQty = parseInt(qtyElement.textContent);
            
            if (currentQty > 1) {
                qtyElement.textContent = currentQty - 1;
                cartCount--;
                updateCartBadge();
            } else {
                // Remove from cart
                const quantityControl = document.getElementById(`quantity-${productId}`);
                const addButton = document.getElementById(`addBtn-${productId}`);
                
                if (quantityControl && addButton) {
                    quantityControl.style.display = 'none';
                    addButton.style.display = 'flex';
                }
                
                cartCount--;
                updateCartBadge();
            }
        }

        // Language toggle
        function toggleLanguage() {
            const currentLang = document.documentElement.lang;
            if (currentLang === 'ar') {
                // Switch to French
                document.documentElement.lang = 'fr';
                document.documentElement.dir = 'ltr';
                document.querySelector('.lang-toggle').innerHTML = '<i class="fas fa-globe"></i> AR';
                // Update content to French (simplified for demo)
                document.querySelector('.logo span').textContent = 'Supermarché Algérie';
                document.querySelector('.search-input').placeholder = 'Rechercher des produits...';
            } else {
                // Switch to Arabic
                document.documentElement.lang = 'ar';
                document.documentElement.dir = 'rtl';
                document.querySelector('.lang-toggle').innerHTML = '<i class="fas fa-globe"></i> FR';
                document.querySelector('.logo span').textContent = 'سوبرماركت الجزائر';
                document.querySelector('.search-input').placeholder = 'ابحث عن منتجات...';
            }
        }

        // Filter by category
        function filterByCategory(category) {
            // Add active class to selected category
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
            });
            event.target.closest('.category-item').classList.add('active');
            
            // Filter products (simplified for demo)
            showToast(`تم تحديد فئة: ${category}`, 'info');
        }

        // Toast notifications
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                max-width: 300px;
            `;
            toast.textContent = message;
            
            // Add slide-in animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    document.body.removeChild(toast);
                    document.head.removeChild(style);
                }, 300);
            }, 3000);
        }

        // Quick action handlers
        function showDeliveryInfo() {
            showToast('معلومات التوصيل: توصيل مجاني للطلبات أكثر من 1000 د.ج', 'info');
        }

        function showOffers() {
            showToast('تحقق من العروض الخاصة في قسم العروض!', 'info');
        }

        function showOrders() {
            showToast('سيتم فتح صفحة طلباتي...', 'info');
        }

        function showSupport() {
            showToast('يمكنك التواصل معنا على: +213 555 123 456', 'info');
        }

        function toggleCart() {
            showToast('سيتم فتح سلة التسوق...', 'info');
        }

        // Search functionality
        document.querySelector('.search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value;
                if (searchTerm.trim()) {
                    showToast(`البحث عن: ${searchTerm}`, 'info');
                }
            }
        });

        document.querySelector('.search-btn').addEventListener('click', function() {
            const searchTerm = document.querySelector('.search-input').value;
            if (searchTerm.trim()) {
                showToast(`البحث عن: ${searchTerm}`, 'info');
            }
        });

        // Favorite button functionality
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    this.style.color = '#EF4444';
                    showToast('تم إضافة المنتج للمفضلة!', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    this.style.color = '';
                    showToast('تم إزالة المنتج من المفضلة', 'info');
                }
            });
        });

        // Service Worker registration for PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Add intersection observer for animations
        const observeElements = document.querySelectorAll('.fade-in');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        observeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Initialize cart count
        updateCartBadge();
    </script>
</body>
</html>
