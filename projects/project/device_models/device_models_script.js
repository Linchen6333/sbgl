// 获取元素
const addButton = document.getElementById('addButton');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const deviceTableBody = document.getElementById('deviceTable').getElementsByTagName('tbody')[0];
const selectAllCheckbox = document.getElementById('selectAll');
const batchDeleteButton = document.getElementById('batchDeleteButton');
const brandSearch = document.getElementById('brandSearch');
const modelSearch = document.getElementById('modelSearch');
const searchButton = document.getElementById('searchButton');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// 分页参数
let currentPage = 1;
const pageSize = 10;
let totalItems = 0;

// 关闭弹窗
const closeModal = (modal) => {
    modal.style.display = 'none';
};

// 打开新增弹窗
addButton.addEventListener('click', () => {
    addModal.style.display = 'block';
});

// 新增设备型号提交
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const brand = document.getElementById('brand').value;
    const model = document.getElementById('model').value;
    const ram = document.getElementById('ram').value;
    const storage = document.getElementById('storage').value;
    
    fetch('http://localhost:3003/api/device-models', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            brand: brand,
            model: model,
            ram: ram,
            storage: storage
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadDeviceModels();
            closeModal(addModal);
            addForm.reset();
            alert('设备型号添加成功');
        } else {
            alert('新增失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('网络错误');
    });
});

// 打开修改弹窗并填充数据
const openEditModal = (device) => {
    editModal.style.display = 'block';
    document.getElementById('editId').value = device.id;
    document.getElementById('editBrand').value = device.brand;
    document.getElementById('editModel').value = device.model;
    document.getElementById('editRam').value = device.ram;
    document.getElementById('editStorage').value = device.storage;
};

// 修改设备型号提交
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const brand = document.getElementById('editBrand').value;
    const model = document.getElementById('editModel').value;
    const ram = document.getElementById('editRam').value;
    const storage = document.getElementById('editStorage').value;
    
    fetch(`http://localhost:3003/api/device-models/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            brand: brand,
            model: model,
            ram: ram,
            storage: storage
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadDeviceModels();
            closeModal(editModal);
            alert('设备型号修改成功');
        } else {
            alert('修改失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('网络错误');
    });
});

// 格式化时间为 yyyy/mm/dd HH:mm:ss 格式
const formatDateTime = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

// 删除设备型号
const deleteDeviceModel = (id) => {
    if (confirm('确定要删除该设备型号吗？')) {
        fetch(`http://localhost:3003/api/device-models/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功');
                loadDeviceModels();
            } else {
                alert('删除失败：' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('网络错误');
        });
    }
};

// 批量删除设备型号
const batchDeleteDeviceModels = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);

    if (selectedIds.length === 0) {
        alert('请选择要删除的设备型号');
        return;
    }

    if (confirm(`确定要删除选中的${selectedIds.length}个设备型号吗？`)) {
        fetch('http://localhost:3003/api/device-models/batch-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`成功删除${data.deletedCount}个设备型号`);
                loadDeviceModels();
                selectAllCheckbox.checked = false;
                batchDeleteButton.style.display = 'none';
            } else {
                alert('批量删除失败：' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('网络错误');
        });
    }
};

// 全选功能
selectAllCheckbox.addEventListener('change', () => {
    const rowCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox');
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    updateBatchDeleteButtonVisibility();
});

// 更新批量删除按钮的显示状态
const updateBatchDeleteButtonVisibility = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    batchDeleteButton.style.display = selectedCheckboxes.length > 0 ? 'block' : 'none';
};

// 加载设备型号数据
const loadDeviceModels = () => {
    const brand = brandSearch.value;
    const model = modelSearch.value;
    
    fetch(`http://localhost:3003/api/device-models?page=${currentPage}&pageSize=${pageSize}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            deviceTableBody.innerHTML = '';
            data.data.forEach((device, index) => {
                const row = document.createElement('tr');
                
                // 创建单元格
                const checkboxCell = document.createElement('td');
                const numberCell = document.createElement('td');
                const brandCell = document.createElement('td');
                const modelCell = document.createElement('td');
                const ramCell = document.createElement('td');
                const storageCell = document.createElement('td');
                const creatorCell = document.createElement('td');
                const timeCell = document.createElement('td');
                const actionCell = document.createElement('td');

                // 复选框
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('rowCheckbox');
                checkbox.dataset.id = device.id;
                checkbox.addEventListener('change', updateBatchDeleteButtonVisibility);
                checkboxCell.appendChild(checkbox);

                // 填充数据
                numberCell.textContent = (currentPage - 1) * pageSize + index + 1;
                brandCell.textContent = device.brand;
                modelCell.textContent = device.model;
                ramCell.textContent = device.ram;
                storageCell.textContent = device.storage;
                creatorCell.textContent = device.creator;
                timeCell.textContent = formatDateTime(device.create_time);
                
                // 操作按钮
                actionCell.innerHTML = `
                    <button class="button button-action button-edit" onclick="openEditModal(${escapeHtml(JSON.stringify(device))})">修改</button>
                    <button class="button button-action button-delete" onclick="deleteDeviceModel(${device.id})">删除</button>
                `;

                // 添加到行
                row.appendChild(checkboxCell);
                row.appendChild(numberCell);
                row.appendChild(brandCell);
                row.appendChild(modelCell);
                row.appendChild(ramCell);
                row.appendChild(storageCell);
                row.appendChild(creatorCell);
                row.appendChild(timeCell);
                row.appendChild(actionCell);

                deviceTableBody.appendChild(row);
            });
            
            // 更新分页信息
            totalItems = data.pagination.total;
            pageInfo.textContent = `第 ${currentPage} 页 / 共 ${Math.ceil(totalItems / pageSize)} 页`;
            
            // 更新按钮状态
            prevPageButton.disabled = currentPage <= 1;
            nextPageButton.disabled = currentPage >= Math.ceil(totalItems / pageSize);
            
            selectAllCheckbox.checked = false;
            updateBatchDeleteButtonVisibility();
        } else {
            alert('加载数据失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载数据失败');
    });
};

// 防止XSS攻击的简单HTML转义
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    if (typeof unsafe === 'object') return unsafe;
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 批量删除按钮点击事件
batchDeleteButton.addEventListener('click', batchDeleteDeviceModels);

// 搜索按钮点击事件
searchButton.addEventListener('click', () => {
    currentPage = 1;
    loadDeviceModels();
});

// 上一页
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadDeviceModels();
    }
});

// 下一页
nextPageButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalItems / pageSize)) {
        currentPage++;
        loadDeviceModels();
    }
});

// 初始加载设备型号数据
window.onload = loadDeviceModels;