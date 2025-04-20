// 获取元素
const addButton = document.getElementById('addButton');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const userTableBody = document.getElementById('userTable').getElementsByTagName('tbody')[0];
const selectAllCheckbox = document.getElementById('selectAll');
const batchDeleteButton = document.getElementById('batchDeleteButton');

// 关闭弹窗
const closeModal = (modal) => {
    modal.style.display = 'none';
};

// 打开新增弹窗
addButton.addEventListener('click', () => {
    addModal.style.display = 'block';
});

// 新增用户提交
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadUsers();
            closeModal(addModal);
            addForm.reset();
            alert('用户添加成功');
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
const openEditModal = (id, username) => {
    editModal.style.display = 'block';
    document.getElementById('editId').value = id;
    document.getElementById('editUsername').value = username;
    document.getElementById('editPassword').value = '';
};

// 修改用户提交
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;
    
    fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password || undefined // 如果密码为空则不发送
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadUsers();
            closeModal(editModal);
            alert('用户修改成功');
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

// 删除用户
const deleteUser = (id) => {
    if (confirm('确定要删除该用户吗？')) {
        fetch(`http://localhost:3000/api/users/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功');
                loadUsers();
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

// 批量删除用户
const batchDeleteUsers = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);

    if (selectedIds.length === 0) {
        alert('请选择要删除的用户');
        return;
    }

    if (confirm(`确定要删除选中的${selectedIds.length}个用户吗？`)) {
        fetch('http://localhost:3000/api/users/batch-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`成功删除${data.deletedCount}个用户`);
                loadUsers();
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

// 加载用户数据
const loadUsers = () => {
    fetch('http://localhost:3000/api/users')
    .then(response => response.json())
    .then(data => {
        userTableBody.innerHTML = '';
        data.forEach((user, index) => {
            const row = document.createElement('tr');
            
            // 创建单元格
            const checkboxCell = document.createElement('td');
            const numberCell = document.createElement('td');
            const usernameCell = document.createElement('td');
            const creatorCell = document.createElement('td');
            const timeCell = document.createElement('td');
            const actionCell = document.createElement('td');

            // 复选框
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('rowCheckbox');
            checkbox.dataset.id = user.id;
            checkbox.addEventListener('change', updateBatchDeleteButtonVisibility);
            checkboxCell.appendChild(checkbox);

            // 填充数据
            numberCell.textContent = index + 1;
            usernameCell.textContent = user.username;
            creatorCell.textContent = user.creator;
            timeCell.textContent = formatDateTime(user.create_time);
            
            // 操作按钮
            actionCell.innerHTML = `
                <button class="button button-action button-edit" onclick="openEditModal(${user.id}, '${escapeHtml(user.username)}')">修改</button>
                <button class="button button-action button-delete" onclick="deleteUser(${user.id})">删除</button>
            `;

            // 添加到行
            row.appendChild(checkboxCell);
            row.appendChild(numberCell);
            row.appendChild(usernameCell);
            row.appendChild(creatorCell);
            row.appendChild(timeCell);
            row.appendChild(actionCell);

            userTableBody.appendChild(row);
        });
        selectAllCheckbox.checked = false;
        updateBatchDeleteButtonVisibility();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载数据失败');
    });
};

// 防止XSS攻击的简单HTML转义
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 批量删除按钮点击事件
batchDeleteButton.addEventListener('click', batchDeleteUsers);

// 初始加载用户数据
window.onload = loadUsers;