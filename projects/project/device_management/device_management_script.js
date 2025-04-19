// 获取元素
const addButton = document.getElementById('addButton');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const deviceTableBody = document.getElementById('deviceTable').getElementsByTagName('tbody')[0];
const selectAllCheckbox = document.getElementById('selectAll');
const batchDeleteButton = document.getElementById('batchDeleteButton');
const deviceNumberSearch = document.getElementById('deviceNumberSearch');
const simCardNumberSearch = document.getElementById('simCardNumberSearch');
const notesSearch = document.getElementById('notesSearch');
const searchButton = document.getElementById('searchButton');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const modelFilter = document.getElementById('modelFilter');
const statusFilter = document.getElementById('statusFilter');
const holderFilter = document.getElementById('holderFilter');
const resetFilterButton = document.getElementById('resetFilterButton');

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

// 新增设备提交
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const deviceNumber = document.getElementById('deviceNumber').value;
    const modelId = document.getElementById('modelId').value;
    const simCardNumber = document.getElementById('simCardNumber').value;
    const statusId = document.getElementById('statusId').value;
    const holderId = document.getElementById('holderId').value;
    const notes = document.getElementById('notes').value;
    
    fetch('http://localhost:3005/api/devices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            deviceNumber: deviceNumber,
            modelId: modelId,
            simCardNumber: simCardNumber,
            statusId: statusId,
            holderId: holderId || null,
            notes: notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadDevices();
            closeModal(addModal);
            addForm.reset();
            alert('设备添加成功');
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
    document.getElementById('editDeviceNumber').value = device.device_number;
    document.getElementById('editSimCardNumber').value = device.sim_card_number || '';
    document.getElementById('editNotes').value = device.notes || '';
    
    // 设置设备型号
    const editModelSelect = document.getElementById('editModelId');
    Array.from(editModelSelect.options).forEach(option => {
        if (option.value === device.model_id.toString()) {
            option.selected = true;
        }
    });
    
    // 设置设备状态
    const editStatusSelect = document.getElementById('editStatusId');
    Array.from(editStatusSelect.options).forEach(option => {
        if (option.text === device.status) {
            option.selected = true;
        }
    });
    
    // 设置持有人
    const editHolderSelect = document.getElementById('editHolderId');
    Array.from(editHolderSelect.options).forEach(option => {
        if (option.text === (device.holder_name || '')) {
            option.selected = true;
        }
    });
};

// 修改设备提交
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const deviceNumber = document.getElementById('editDeviceNumber').value;
    const modelId = document.getElementById('editModelId').value;
    const simCardNumber = document.getElementById('editSimCardNumber').value;
    const statusId = document.getElementById('editStatusId').value;
    const holderId = document.getElementById('editHolderId').value;
    const notes = document.getElementById('editNotes').value;
    
    fetch(`http://localhost:3005/api/devices/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            deviceNumber: deviceNumber,
            modelId: modelId,
            simCardNumber: simCardNumber,
            statusId: statusId,
            holderId: holderId || null,
            notes: notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadDevices();
            closeModal(editModal);
            alert('设备修改成功');
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

// 删除设备
const deleteDevice = (id) => {
    if (confirm('确定要删除该设备吗？')) {
        fetch(`http://localhost:3005/api/devices/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功');
                loadDevices();
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

// 批量删除设备
const batchDeleteDevices = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);

    if (selectedIds.length === 0) {
        alert('请选择要删除的设备');
        return;
    }

    if (confirm(`确定要删除选中的${selectedIds.length}个设备吗？`)) {
        fetch('http://localhost:3005/api/devices/batch-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: selectedIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`成功删除${data.deletedCount}个设备`);
                loadDevices();
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

// 加载设备数据
const loadDevices = () => {
    const deviceNumber = deviceNumberSearch.value;
    const simCardNumber = simCardNumberSearch.value;
    const notes = notesSearch.value;
    const modelId = modelFilter.value;
    const statusId = statusFilter.value;
    const holderId = holderFilter.value;
    
    fetch(`http://localhost:3005/api/devices?page=${currentPage}&pageSize=${pageSize}&deviceNumber=${encodeURIComponent(deviceNumber)}&simCardNumber=${encodeURIComponent(simCardNumber)}&notes=${encodeURIComponent(notes)}&modelId=${modelId}&statusId=${statusId}&holderId=${holderId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            deviceTableBody.innerHTML = '';
            data.data.forEach((device, index) => {
                const row = document.createElement('tr');
                
                // 创建单元格
                const checkboxCell = document.createElement('td');
                const numberCell = document.createElement('td');
                const deviceNumberCell = document.createElement('td');
                const modelCell = document.createElement('td');
                const ramCell = document.createElement('td');
                const storageCell = document.createElement('td');
                const simCardNumberCell = document.createElement('td');
                const statusCell = document.createElement('td');
                const holderCell = document.createElement('td');
                const notesCell = document.createElement('td');
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
                deviceNumberCell.textContent = device.device_number;
                modelCell.textContent = `${device.brand} ${device.model}`;
                ramCell.textContent = device.ram;
                storageCell.textContent = device.storage;
                simCardNumberCell.textContent = device.sim_card_number || '-';
                statusCell.textContent = device.status;
                holderCell.textContent = device.holder_name || '-';
                notesCell.textContent = device.notes || '-';
                creatorCell.textContent = device.creator;
                timeCell.textContent = formatDateTime(device.create_time);
                
                // 操作按钮
                actionCell.innerHTML = `
                    <button class="button button-action button-edit" onclick="openEditModal(${escapeHtml(JSON.stringify(device))})">修改</button>
                    <button class="button button-action button-delete" onclick="deleteDevice(${device.id})">删除</button>
                `;

                // 添加到行
                row.appendChild(checkboxCell);
                row.appendChild(numberCell);
                row.appendChild(deviceNumberCell);
                row.appendChild(modelCell);
                row.appendChild(ramCell);
                row.appendChild(storageCell);
                row.appendChild(simCardNumberCell);
                row.appendChild(statusCell);
                row.appendChild(holderCell);
                row.appendChild(notesCell);
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

// 加载设备型号选项
const loadDeviceModels = () => {
    fetch('http://localhost:3005/api/device-models')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modelSelects = [
                document.getElementById('modelId'),
                document.getElementById('editModelId'),
                modelFilter
            ];
            
            modelSelects.forEach(select => {
                select.innerHTML = '<option value="">请选择设备型号</option>';
                data.data.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.name;
                    select.appendChild(option);
                });
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

// 加载设备状态选项
const loadDeviceStatus = () => {
    fetch('http://localhost:3005/api/device-status')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const statusSelects = [
                document.getElementById('statusId'),
                document.getElementById('editStatusId'),
                statusFilter
            ];
            
            statusSelects.forEach(select => {
                select.innerHTML = '<option value="">请选择设备状态</option>';
                data.data.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status.id;
                    option.textContent = status.name;
                    select.appendChild(option);
                });
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

// 加载账号持有人选项
const loadAccountHolders = () => {
    fetch('http://localhost:3005/api/account-holders-list')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const holderSelects = [
                document.getElementById('holderId'),
                document.getElementById('editHolderId'),
                holderFilter
            ];
            
            holderSelects.forEach(select => {
                select.innerHTML = '<option value="">请选择持有人</option>';
                data.data.forEach(holder => {
                    const option = document.createElement('option');
                    option.value = holder.id;
                    option.textContent = holder.name;
                    select.appendChild(option);
                });
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
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
batchDeleteButton.addEventListener('click', batchDeleteDevices);

// 搜索按钮点击事件
searchButton.addEventListener('click', () => {
    currentPage = 1;
    loadDevices();
});

// 筛选重置按钮点击事件
resetFilterButton.addEventListener('click', () => {
    modelFilter.value = '';
    statusFilter.value = '';
    holderFilter.value = '';
    currentPage = 1;
    loadDevices();
});

// 筛选条件变化事件
[modelFilter, statusFilter, holderFilter].forEach(filter => {
    filter.addEventListener('change', () => {
        currentPage = 1;
        loadDevices();
    });
});

// 上一页
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadDevices();
    }
});

// 下一页
nextPageButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalItems / pageSize)) {
        currentPage++;
        loadDevices();
    }
});

// 初始加载数据
window.onload = () => {
    loadDeviceModels();
    loadDeviceStatus();
    loadAccountHolders();
    loadDevices();
};