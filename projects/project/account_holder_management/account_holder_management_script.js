// 获取元素
const addButton = document.getElementById('addButton');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const holderTableBody = document.getElementById('holderTable').getElementsByTagName('tbody')[0];
const selectAllCheckbox = document.getElementById('selectAll');
const batchDeleteButton = document.getElementById('batchDeleteButton');
const nameSearch = document.getElementById('nameSearch');
const departmentSearch = document.getElementById('departmentSearch');
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

// 新增账号持有人提交
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const department = document.getElementById('department').value;
    
    fetch('http://localhost:3004/api/account-holders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            department: department
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAccountHolders();
            closeModal(addModal);
            addForm.reset();
            alert('账号持有人添加成功');
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
const openEditModal = (holder) => {
    editModal.style.display = 'block';
    document.getElementById('editId').value = holder.id;
    document.getElementById('editName').value = holder.name;
    document.getElementById('editDepartment').value = holder.department;
};

// 修改账号持有人提交
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value;
    const department = document.getElementById('editDepartment').value;
    
    fetch(`http://localhost:3004/api/account-holders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            department: department
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAccountHolders();
            closeModal(editModal);
            alert('账号持有人修改成功');
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

// 删除账号持有人
const deleteAccountHolder = (id) => {
    if (confirm('确定要删除该账号持有人吗？')) {
        fetch(`http://localhost:3004/api/account-holders/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功');
                loadAccountHolders();
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

// 批量删除账号持有人
const batchDeleteAccountHolders = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);

    if (selectedIds.length === 0) {
        alert('请选择要删除的账号持有人');
        return;
    }

    if (confirm(`确定要删除选中的${selectedIds.length}个账号持有人吗？`)) {
        fetch('http://localhost:3004/api/account-holders/batch-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`成功删除${data.deletedCount}个账号持有人`);
                loadAccountHolders();
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

// 加载账号持有人数据
const loadAccountHolders = () => {
    const name = nameSearch.value;
    const department = departmentSearch.value;
    
    fetch(`http://localhost:3004/api/account-holders?page=${currentPage}&pageSize=${pageSize}&name=${encodeURIComponent(name)}&department=${encodeURIComponent(department)}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            holderTableBody.innerHTML = '';
            data.data.forEach((holder, index) => {
                const row = document.createElement('tr');
                
                // 创建单元格
                const checkboxCell = document.createElement('td');
                const numberCell = document.createElement('td');
                const nameCell = document.createElement('td');
                const departmentCell = document.createElement('td');
                const creatorCell = document.createElement('td');
                const timeCell = document.createElement('td');
                const actionCell = document.createElement('td');

                // 复选框
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('rowCheckbox');
                checkbox.dataset.id = holder.id;
                checkbox.addEventListener('change', updateBatchDeleteButtonVisibility);
                checkboxCell.appendChild(checkbox);

                // 填充数据
                numberCell.textContent = (currentPage - 1) * pageSize + index + 1;
                nameCell.textContent = holder.name;
                departmentCell.textContent = holder.department;
                creatorCell.textContent = holder.creator;
                timeCell.textContent = formatDateTime(holder.create_time);
                
                // 操作按钮
                actionCell.innerHTML = `
                    <button class="button button-action button-edit" onclick="openEditModal(${escapeHtml(JSON.stringify(holder))})">修改</button>
                    <button class="button button-action button-delete" onclick="deleteAccountHolder(${holder.id})">删除</button>
                `;

                // 添加到行
                row.appendChild(checkboxCell);
                row.appendChild(numberCell);
                row.appendChild(nameCell);
                row.appendChild(departmentCell);
                row.appendChild(creatorCell);
                row.appendChild(timeCell);
                row.appendChild(actionCell);

                holderTableBody.appendChild(row);
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
batchDeleteButton.addEventListener('click', batchDeleteAccountHolders);

// 搜索按钮点击事件
searchButton.addEventListener('click', () => {
    currentPage = 1;
    loadAccountHolders();
});

// 上一页
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadAccountHolders();
    }
});

// 下一页
nextPageButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalItems / pageSize)) {
        currentPage++;
        loadAccountHolders();
    }
});

// 初始加载账号持有人数据
window.onload = loadAccountHolders;