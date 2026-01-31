// API URL - API gốc của bạn
const API_URL = "https://api.escuelajs.co/api/v1/products";

// Biến lưu trữ dữ liệu
let allProducts = [];
let filteredProducts = [];

// Biến phân trang
let currentPage = 1;
let pageSize = 10;

// Biến sắp xếp
let sortColumn = null; // 'title' hoặc 'price'
let sortDirection = null; // 'asc' hoặc 'desc'

// Hàm getAll - Lấy tất cả sản phẩm từ API
async function getAll() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return [];
  }
}

// Hàm render bảng sản phẩm
function renderTable(products) {
  const container = document.getElementById("tableContainer");

  if (products.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666;">Không có sản phẩm nào.</p>';
    return;
  }

  let tableHTML = `
        <table class="product-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th class="sortable ${sortColumn === "title" ? sortDirection : ""}" onclick="sortBy('title')">
                        Tên sản phẩm
                    </th>
                    <th class="sortable ${sortColumn === "price" ? sortDirection : ""}" onclick="sortBy('price')">
                        Giá
                    </th>
                    <th>Mô tả</th>
                    <th>Danh mục</th>
                </tr>
            </thead>
            <tbody>
    `;

  products.forEach((product) => {
    // Lấy tất cả hình ảnh (tối đa 3 ảnh)
    let imagesHTML = "";

    if (product.images && product.images.length > 0) {
      const maxImages = Math.min(3, product.images.length);

      for (let i = 0; i < maxImages; i++) {
        let rawUrl = product.images[i];

        // Loại bỏ dấu ngoặc vuông và dấu ngoặc kép nếu có
        rawUrl = rawUrl.replace(/[\[\]"]/g, "").trim();

        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
          imagesHTML += `<img src="${rawUrl}" alt="${product.title}" class="product-image" referrerpolicy="no-referrer" onerror="this.remove();" onload="this.style.background='transparent';">`;
        }
      }
    }

    const imageCell = imagesHTML || `<div class="no-image">📦</div>`;

    const categoryName = product.category ? product.category.name : "N/A";

    tableHTML += `
            <tr>
                <td>${product.id}</td>
                <td>${imageCell}</td>
                <td>${product.title}</td>
                <td class="price">$${product.price}</td>
                <td class="description-cell">
                    <span class="description-preview">👁️ Xem mô tả</span>
                    <div class="description-tooltip">
                        ${product.description || "Không có mô tả"}
                    </div>
                </td>
                <td><span class="category-badge">${categoryName}</span></td>
            </tr>
        `;
  });

  tableHTML += "</tbody></table>";
  container.innerHTML = tableHTML;
}

// Hàm tìm kiếm theo title
function handleSearch(searchTerm) {
  filteredProducts = allProducts.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  currentPage = 1; // Reset về trang 1 khi tìm kiếm
  renderCurrentPage();
}

// Hàm render trang hiện tại
function renderCurrentPage() {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  renderTable(paginatedProducts);
  renderPagination();
}

// Hàm render pagination controls
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginationContainer = document.getElementById("paginationContainer");
  const paginationInfo = document.getElementById("paginationInfo");
  const paginationButtons = document.getElementById("paginationButtons");

  if (filteredProducts.length === 0) {
    paginationContainer.style.display = "none";
    return;
  }

  paginationContainer.style.display = "flex";

  // Hiển thị thông tin trang
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredProducts.length);
  paginationInfo.innerHTML = `Hiển thị ${startItem}-${endItem} / ${filteredProducts.length} sản phẩm`;

  // Tạo các nút phân trang
  let buttonsHTML = "";

  // Nút Previous
  buttonsHTML += `<button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>« Trước</button>`;

  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      buttonsHTML += `<button class="page-number ${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      buttonsHTML += `<button class="page-number" disabled>...</button>`;
    }
  }

  // Nút Next
  buttonsHTML += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>Sau »</button>`;

  paginationButtons.innerHTML = buttonsHTML;
}

// Hàm chuyển trang
function goToPage(page) {
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderCurrentPage();
  }
}

// Hàm thay đổi số lượng hiển thị mỗi trang
function changePageSize(size) {
  pageSize = parseInt(size);
  currentPage = 1; // Reset về trang 1
  renderCurrentPage();
}

// Hàm sắp xếp theo cột
function sortBy(column) {
  // Nếu click vào cùng cột, đảo chiều sắp xếp
  if (sortColumn === column) {
    if (sortDirection === "asc") {
      sortDirection = "desc";
    } else if (sortDirection === "desc") {
      sortDirection = null;
      sortColumn = null;
    } else {
      sortDirection = "asc";
    }
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }

  // Thực hiện sắp xếp
  if (sortColumn && sortDirection) {
    filteredProducts.sort((a, b) => {
      let valA, valB;

      if (column === "title") {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (column === "price") {
        valA = a.price;
        valB = b.price;
      }

      if (sortDirection === "asc") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
  } else {
    // Reset về thứ tự gốc
    const searchTerm = document.getElementById("searchInput").value;
    filteredProducts = allProducts.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  currentPage = 1;
  renderCurrentPage();
}

// Khởi chạy
async function init() {
  allProducts = await getAll();
  filteredProducts = allProducts;
  renderCurrentPage();
}

// Chạy khi trang load xong
document.addEventListener("DOMContentLoaded", init);
