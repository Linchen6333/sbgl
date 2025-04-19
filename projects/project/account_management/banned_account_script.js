// 获取元素
const moveToNormalModal = document.getElementById('moveToNormalModal');
const confirmMoveToNormal = document.getElementById('confirmMoveToNormal');
const bannedAccountTableBody = document.getElementById('bannedAccountTable').getElementsByTagName('tbody')[0];
const selectAllCheckbox = document.getElementById('selectAll');
const batchMoveToNormalButton = document.getElementById('batchMoveToNormalButton');
const accountSearch = document.getElementById('accountSearch');
const phoneNumberSearch = document.getElementById('phoneNumberSearch');
const realNamePersonSearch = document.getElementById('realNamePersonSearch');
const searchButton = document.getElementById('searchButton');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const platformFilter = document.getElementById('platformFilter');
const registrationMethodFilter = document.getElementById('registrationMethodFilter');
const realNameSourceFilter = document.getElementById('realNameSourceFilter');
const statusFilter = document.getElementById('statusFilter');
const originalDeviceFilter = document.getElementById('originalDeviceFilter');
const originalHolderFilter = document.getElementById('originalHolderFilter');
const resetFilterButton = document.getElementById('resetFilterButton');

// 分页参数
let currentPage = 1;
const pageSize = 10;
let totalItems = 0;
let currentMoveId = null;

// 关闭弹窗
const closeModal = (modal) => {
    modal.style.display = 'none';
};

// 格式化时间为 yyyy/mm/dd HH:mm:ss 格式
const formatDateTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

// 删除封号账号
const deleteBannedAccount = (id) => {
    if (confirm('确定要删除该封号账号记录吗？')) {
        fetch(`http://localhost:3006/api/banned-accounts/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功');
                loadBannedAccounts();
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

// 打开移回账号列表弹窗
const openMoveToNormalModal = (id) => {
    currentMoveId = id;
    moveToNormalModal.style.display = 'block';
};

// 移回账号列表
const moveToNormal = (id) => {
    fetch(`http://localhost:3006/api/banned-accounts/move-to-normal/${id}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadBannedAccounts();
            closeModal(moveToNormalModal);
            alert('账号已移回账号列表');
        } else {
            alert('操作失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('网络错误');
    });
};

// 批量移回账号列表
const batchMoveToNormal = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);

    if (selectedIds.length === 0) {
        alert('请选择要移回账号列表的记录');
        return;
    }

    if (confirm(`确定要将选中的${selectedIds.length}条记录移回账号列表吗？`)) {
        Promise.all(selectedIds.map(id => 
            fetch(`http://localhost:3006/api/banned-accounts/move-to-normal/${id}`, {
                method: 'POST'
            }).then(res => res.json())
        ))
        .then(results => {
            const successCount = results.filter(r => r.success).length;
            if (successCount > 0) {
                alert(`成功将${successCount}条记录移回账号列表`);
                loadBannedAccounts();
                selectAllCheckbox.checked = false;
                batchMoveToNormalButton.style.display = 'none';
            } else {
                alert('批量操作失败');
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
    updateBatchMoveButtonVisibility();
});

// 更新批量移入按钮的显示状态
const updateBatchMoveButtonVisibility = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    batchMoveToNormalButton.style.display = selectedCheckboxes.length > 0 ? 'block' : 'none';
};

// 加载封号账号数据
const loadBannedAccounts = () => {
    const account = accountSearch.value;
    const phoneNumber = phoneNumberSearch.value;
    const realNamePerson = realNamePersonSearch.value;
    const platform = platformFilter.value;
    const registrationMethod = registrationMethodFilter.value;
    const realNameSource = realNameSourceFilter.value;
    const status = statusFilter.value;
    const originalDeviceId = originalDeviceFilter.value;
    const originalHolderId = originalHolderFilter.value;
    
    fetch(`http://localhost:3006/api/banned-accounts?page=${currentPage}&pageSize=${pageSize}&account=${encodeURIComponent(account)}&phoneNumber=${encodeURIComponent(phoneNumber)}&realNamePerson=${encodeURIComponent(realNamePerson)}&platform=${platform}&registrationMethod=${registrationMethod}&realNameSource=${realNameSource}&status=${status}&originalDeviceId=${originalDeviceId}&originalHolderId=${originalHolderId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            bannedAccountTableBody.innerHTML = '';
            data.data.forEach((account, index) => {
                const row = document.createElement('tr');
                
                // 创建单元格
                const checkboxCell = document.createElement('td');
                const numberCell = document.createElement('td');
                const platformCell = document.createElement('td');
                const accountCell = document.createElement('td');
                const passwordCell = document.createElement('td');
                const registrationMethodCell = document.createElement('td');
                const phoneNumberCell = document.createElement('td');
                const phoneNumberSourceCell = document.createElement('td');
                const realNameSourceCell = document.createElement('td');
                const realNamePersonCell = document.createElement('td');
                const realNamePositionCell = document.createElement('td');
                const originalDeviceCell = document.createElement('td');
                const originalHolderCell = document.createElement('td');
                const statusCell = document.createElement('td');
                const createTimeCell = document.createElement('td');
                const updaterCell = document.createElement('td');
                const updateTimeCell = document.createElement('td');
                const actionCell = document.createElement('td');

                // 复选框
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('rowCheckbox');
                checkbox.dataset.id = account.id;
                checkbox.addEventListener('change', updateBatchMoveButtonVisibility);
                checkboxCell.appendChild(checkbox);

                // 填充数据
                numberCell.textContent = (currentPage - 1) * pageSize + index + 1;
                platformCell.textContent = account.platform;
                accountCell.textContent = account.account;
                passwordCell.textContent = account.password;
                registrationMethodCell.textContent = account.registration_method;
                phoneNumberCell.textContent = account.phone_number || '-';
                phoneNumberSourceCell.textContent = account.phone_number_source || '-';
                realNameSourceCell.textContent = account.real_name_source;
                realNamePersonCell.textContent = account.real_name_person || '-';
                realNamePositionCell.textContent = account.real_name_position || '-';
                originalDeviceCell.textContent = account.original_device_number || '-';
                originalHolderCell.textContent = account.original_holder_name || '-';
                statusCell.textContent = account.status;
                createTimeCell.textContent = formatDateTime(account.create_time);
                updaterCell.textContent = account.updater || '-';
                updateTimeCell.textContent = formatDateTime(account.update_time);
                
                // 操作按钮
                actionCell.innerHTML = `
                    <button class="button button-action button-delete" onclick="deleteBannedAccount(${account.id})">删除</button>
                    <button class="button button-action button-batch-delete" onclick="openMoveToNormalModal(${account.id})">移回账号</button>
                `;

                // 添加到行
                row.appendChild(checkboxCell);
                row.appendChild(numberCell);
                row.appendChild(platformCell);
                row.appendChild(accountCell);
                row.appendChild(passwordCell);
                row.appendChild(registrationMethodCell);
                row.appendChild(phoneNumberCell);
                row.appendChild(phoneNumberSourceCell);
                row.appendChild(realNameSourceCell);
                row.appendChild(realNamePersonCell);
                row.appendChild(realNamePositionCell);
                row.appendChild(originalDeviceCell);
                row.appendChild(originalHolderCell);
                row.appendChild(statusCell);
                row.appendChild(createTimeCell);
                row.appendChild(updaterCell);
                row.appendChild(updateTimeCell);
                row.appendChild(actionCell);

                bannedAccountTableBody.appendChild(row);
            });
            
            // 更新分页信息
            totalItems = data.pagination.total;
            pageInfo.textContent = `第 ${currentPage} 页 / 共 ${Math.ceil(totalItems / pageSize)} 页`;
            
            // 更新按钮状态
            prevPageButton.disabled = currentPage <= 1;
            nextPageButton.disabled = currentPage >= Math.ceil(totalItems / pageSize);
            
            selectAllCheckbox.checked = false;
            updateBatchMoveButtonVisibility();
        } else {
            alert('加载数据失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载数据失败');
    });
};

// 加载平台选项
const loadPlatforms = () => {
    fetch('http://localhost:3006/api/platforms')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const platformSelect = platformFilter;
            data.data.forEach(platform => {
                const option = document.createElement('option');
                option.value = platform.platform;
                option.textContent = platform.platform;
                platformSelect.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

// 加载设备列表选项
const loadDevices = () => {
    fetch('http://localhost:3006/api/devices-list')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const deviceSelect = originalDeviceFilter;
            deviceSelect.innerHTML = '<option value="">所有原登入设备</option>';
            data.data.forEach(device => {
                const option = document.createElement('option');
                option.value = device.id;
                option.textContent = device.device_number;
                deviceSelect.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

// 加载账号持有人选项
const loadAccountHolders = () => {
    fetch('http://localhost:3006/api/account-holders-list')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const holderSelect = originalHolderFilter;
            holderSelect.innerHTML = '<option value="">所有原持有人</option>';
            data.data.forEach(holder => {
                const option = document.createElement('option');
                option.value = holder.id;
                option.textContent = holder.name;
                holderSelect.appendChild(option);
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

// 确认移回账号列表
confirmMoveToNormal.addEventListener('click', () => {
    if (currentMoveId) {
        moveToNormal(currentMoveId);
    }
});

// 批量移回按钮点击事件
batchMoveToNormalButton.addEventListener('click', batchMoveToNormal);

// 搜索按钮点击事件
searchButton.addEventListener('click', () => {
    currentPage = 1;
    loadBannedAccounts();
});

// 筛选重置按钮点击事件
resetFilterButton.addEventListener('click', () => {
    platformFilter.value = '';
    registrationMethodFilter.value = '';
    realNameSourceFilter.value = '';
    statusFilter.value = '';
    originalDeviceFilter.value = '';
    originalHolderFilter.value = '';
    currentPage = 1;
    loadBannedAccounts();
});

// 筛选条件变化事件
[platformFilter, registrationMethodFilter, realNameSourceFilter, statusFilter, originalDeviceFilter, originalHolderFilter].forEach(filter => {
    filter.addEventListener('change', () => {
        currentPage = 1;
        loadBannedAccounts();
    });
});

// 上一页
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadBannedAccounts();
    }
});

// 下一页
nextPageButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalItems / pageSize)) {
        currentPage++;
        loadBannedAccounts();
    }
});

// 初始加载数据
window.onload = () => {
    loadPlatforms();
    loadDevices();
    loadAccountHolders();
    loadBannedAccounts();
};