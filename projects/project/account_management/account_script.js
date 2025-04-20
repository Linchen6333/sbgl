// 获取元素
const addButton = document.getElementById('addButton');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const moveToBannedModal = document.getElementById('moveToBannedModal');
const moveToBannedForm = document.getElementById('moveToBannedForm');
const accountTableBody = document.getElementById('accountTable').getElementsByTagName('tbody')[0];
const selectAllCheckbox = document.getElementById('selectAll');
const batchMoveToBannedButton = document.getElementById('batchMoveToBannedButton');
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
const holderFilter = document.getElementById('holderFilter');
const statusFilter = document.getElementById('statusFilter');
const resetFilterButton = document.getElementById('resetFilterButton');
const statusSelect = document.getElementById('status');
const unbanTimeGroup = document.getElementById('unbanTimeGroup');
const editStatusSelect = document.getElementById('editStatus');
const editUnbanTimeGroup = document.getElementById('editUnbanTimeGroup');

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

// 状态选择变化事件
statusSelect.addEventListener('change', () => {
    unbanTimeGroup.style.display = ['临时封禁', '永久封禁'].includes(statusSelect.value) ? 'block' : 'none';
});

editStatusSelect.addEventListener('change', () => {
    editUnbanTimeGroup.style.display = ['临时封禁', '永久封禁'].includes(editStatusSelect.value) ? 'block' : 'none';
});

// 新增账号提交
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const platform = document.getElementById('platform').value;
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;
    const registrationMethod = document.getElementById('registrationMethod').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const realNameSource = document.getElementById('realNameSource').value;
    const realNamePerson = document.getElementById('realNamePerson').value;
    const realNamePosition = document.getElementById('realNamePosition').value;
    const deviceId = document.getElementById('deviceId').value;
    const holderId = document.getElementById('holderId').value;
    const status = document.getElementById('status').value;
    const unbanTime = document.getElementById('unbanTime').value;
    
    fetch('http://localhost:3006/api/accounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            platform: platform,
            account: account,
            password: password,
            registrationMethod: registrationMethod,
            phoneNumber: phoneNumber,
            realNameSource: realNameSource,
            realNamePerson: realNamePerson,
            realNamePosition: realNamePosition,
            deviceId: deviceId || null,
            holderId: holderId || null,
            status: status,
            unbanTime: unbanTime || null
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAccounts();
            closeModal(addModal);
            addForm.reset();
            alert('账号添加成功');
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
const openEditModal = (account) => {
    editModal.style.display = 'block';
    document.getElementById('editId').value = account.id;
    document.getElementById('editPlatform').value = account.platform;
    document.getElementById('editAccount').value = account.account;
    document.getElementById('editPassword').value = account.password;
    document.getElementById('editPhoneNumber').value = account.phone_number || '';
    document.getElementById('editRealNamePerson').value = account.real_name_person || '';
    document.getElementById('editRealNamePosition').value = account.real_name_position || '';
    
    // 设置注册方式
    const editRegistrationMethodSelect = document.getElementById('editRegistrationMethod');
    Array.from(editRegistrationMethodSelect.options).forEach(option => {
        if (option.value === account.registration_method) {
            option.selected = true;
        }
    });
    
    // 设置实名来源
    const editRealNameSourceSelect = document.getElementById('editRealNameSource');
    Array.from(editRealNameSourceSelect.options).forEach(option => {
        if (option.value === account.real_name_source) {
            option.selected = true;
        }
    });
    
    // 设置设备
    const editDeviceSelect = document.getElementById('editDeviceId');
    Array.from(editDeviceSelect.options).forEach(option => {
        if (option.value === (account.device_id ? account.device_id.toString() : '')) {
            option.selected = true;
        }
    });
    
    // 设置持有人
    const editHolderSelect = document.getElementById('editHolderId');
    Array.from(editHolderSelect.options).forEach(option => {
        if (option.value === (account.holder_id ? account.holder_id.toString() : '')) {
            option.selected = true;
        }
    });
    
    // 设置状态
    const editStatusSelect = document.getElementById('editStatus');
    Array.from(editStatusSelect.options).forEach(option => {
        if (option.value === account.status) {
            option.selected = true;
        }
    });
    
    // 显示/隐藏解封时间
    editUnbanTimeGroup.style.display = ['临时封禁', '永久封禁'].includes(account.status) ? 'block' : 'none';
    
    // 设置解封时间
    if (account.unban_time) {
        const unbanTime = new Date(account.unban_time);
        const formattedTime = unbanTime.toISOString().slice(0, 16);
        document.getElementById('editUnbanTime').value = formattedTime;
    } else {
        document.getElementById('editUnbanTime').value = '';
    }
};

// 修改账号提交
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const platform = document.getElementById('editPlatform').value;
    const account = document.getElementById('editAccount').value;
    const password = document.getElementById('editPassword').value;
    const registrationMethod = document.getElementById('editRegistrationMethod').value;
    const phoneNumber = document.getElementById('editPhoneNumber').value;
    const realNameSource = document.getElementById('editRealNameSource').value;
    const realNamePerson = document.getElementById('editRealNamePerson').value;
    const realNamePosition = document.getElementById('editRealNamePosition').value;
    const deviceId = document.getElementById('editDeviceId').value;
    const holderId = document.getElementById('editHolderId').value;
    const status = document.getElementById('editStatus').value;
    const unbanTime = document.getElementById('editUnbanTime').value;
    
    fetch(`http://localhost:3006/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            platform: platform,
            account: account,
            password: password,
            registrationMethod: registrationMethod,
            phoneNumber: phoneNumber,
            realNameSource: realNameSource,
            realNamePerson: realNamePerson,
            realNamePosition: realNamePosition,
            deviceId: deviceId || null,
            holderId: holderId || null,
            status: status,
            unbanTime: unbanTime || null
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAccounts();
            closeModal(editModal);
            alert('账号修改成功');
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

// 格式化解封时间
const formatUnbanTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
};

// 删除账号
const deleteAccount = (id) => {
    if (confirm('确定要删除该账号吗？')) {
        fetch(`http://localhost:3006/api/accounts/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功');
                loadAccounts();
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

// 打开移入封号列表弹窗
const openMoveToBannedModal = (id) => {
    document.getElementById('moveToBannedId').value = id;
    moveToBannedModal.style.display = 'block';
};

// 移入封号列表提交
moveToBannedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('moveToBannedId').value;
    const phoneNumberSource = document.getElementById('phoneNumberSource').value;
    
    fetch(`http://localhost:3006/api/accounts/move-to-banned/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phoneNumberSource: phoneNumberSource
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAccounts();
            closeModal(moveToBannedModal);
            moveToBannedForm.reset();
            alert('账号已移入封号列表');
        } else {
            alert('操作失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('网络错误');
    });
});

// 批量移入封号列表
const batchMoveToBanned = () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"].rowCheckbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);

    if (selectedIds.length === 0) {
        alert('请选择要移入封号列表的账号');
        return;
    }

    if (confirm(`确定要将选中的${selectedIds.length}个账号移入封号列表吗？`)) {
        // 这里需要为每个账号设置手机号来源，简化处理，使用默认值
        const phoneNumberSource = prompt('请输入这些账号的手机号来源:', '默认来源');
        
        if (!phoneNumberSource) {
            alert('请输入手机号来源');
            return;
        }

        Promise.all(selectedIds.map(id => 
            fetch(`http://localhost:3006/api/accounts/move-to-banned/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumberSource: phoneNumberSource
                })
            }).then(res => res.json())
        ))
        .then(results => {
            const successCount = results.filter(r => r.success).length;
            if (successCount > 0) {
                alert(`成功将${successCount}个账号移入封号列表`);
                loadAccounts();
                selectAllCheckbox.checked = false;
                batchMoveToBannedButton.style.display = 'none';
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
    batchMoveToBannedButton.style.display = selectedCheckboxes.length > 0 ? 'block' : 'none';
};

// 加载账号数据
const loadAccounts = () => {
    const account = accountSearch.value;
    const phoneNumber = phoneNumberSearch.value;
    const realNamePerson = realNamePersonSearch.value;
    const platform = platformFilter.value;
    const registrationMethod = registrationMethodFilter.value;
    const realNameSource = realNameSourceFilter.value;
    const holderId = holderFilter.value;
    const status = statusFilter.value;
    
    fetch(`http://localhost:3006/api/accounts?page=${currentPage}&pageSize=${pageSize}&account=${encodeURIComponent(account)}&phoneNumber=${encodeURIComponent(phoneNumber)}&realNamePerson=${encodeURIComponent(realNamePerson)}&platform=${platform}&registrationMethod=${registrationMethod}&realNameSource=${realNameSource}&holderId=${holderId}&status=${status}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            accountTableBody.innerHTML = '';
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
                const realNameSourceCell = document.createElement('td');
                const realNamePersonCell = document.createElement('td');
                const realNamePositionCell = document.createElement('td');
                const deviceCell = document.createElement('td');
                const holderCell = document.createElement('td');
                const statusCell = document.createElement('td');
                const unbanTimeCell = document.createElement('td');
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
                realNameSourceCell.textContent = account.real_name_source;
                realNamePersonCell.textContent = account.real_name_person || '-';
                realNamePositionCell.textContent = account.real_name_position || '-';
                deviceCell.textContent = account.device_number || '-';
                holderCell.textContent = account.holder_name || '-';
                statusCell.textContent = account.status;
                unbanTimeCell.textContent = formatUnbanTime(account.unban_time);
                createTimeCell.textContent = formatDateTime(account.create_time);
                updaterCell.textContent = account.updater || '-';
                updateTimeCell.textContent = formatDateTime(account.update_time);
                
                // 操作按钮
                actionCell.innerHTML = `
                    <button class="button button-action button-edit" onclick="openEditModal(${escapeHtml(JSON.stringify(account))})">修改</button>
                    <button class="button button-action button-delete" onclick="deleteAccount(${account.id})">删除</button>
                    <button class="button button-action button-batch-delete" onclick="openMoveToBannedModal(${account.id})">移入封号</button>
                `;

                // 添加到行
                row.appendChild(checkboxCell);
                row.appendChild(numberCell);
                row.appendChild(platformCell);
                row.appendChild(accountCell);
                row.appendChild(passwordCell);
                row.appendChild(registrationMethodCell);
                row.appendChild(phoneNumberCell);
                row.appendChild(realNameSourceCell);
                row.appendChild(realNamePersonCell);
                row.appendChild(realNamePositionCell);
                row.appendChild(deviceCell);
                row.appendChild(holderCell);
                row.appendChild(statusCell);
                row.appendChild(unbanTimeCell);
                row.appendChild(createTimeCell);
                row.appendChild(updaterCell);
                row.appendChild(updateTimeCell);
                row.appendChild(actionCell);

                accountTableBody.appendChild(row);
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
            const deviceSelects = [
                document.getElementById('deviceId'),
                document.getElementById('editDeviceId')
            ];
            
            deviceSelects.forEach(select => {
                select.innerHTML = '<option value="">无设备</option>';
                data.data.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.id;
                    option.textContent = device.device_number;
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
    fetch('http://localhost:3006/api/account-holders-list')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const holderSelects = [
                document.getElementById('holderId'),
                document.getElementById('editHolderId'),
                holderFilter
            ];
            
            holderSelects.forEach(select => {
                select.innerHTML = '<option value="">无持有人</option>';
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

// 批量移入按钮点击事件
batchMoveToBannedButton.addEventListener('click', batchMoveToBanned);

// 搜索按钮点击事件
searchButton.addEventListener('click', () => {
    currentPage = 1;
    loadAccounts();
});

// 筛选重置按钮点击事件
resetFilterButton.addEventListener('click', () => {
    platformFilter.value = '';
    registrationMethodFilter.value = '';
    realNameSourceFilter.value = '';
    holderFilter.value = '';
    statusFilter.value = '';
    currentPage = 1;
    loadAccounts();
});

// 筛选条件变化事件
[platformFilter, registrationMethodFilter, realNameSourceFilter, holderFilter, statusFilter].forEach(filter => {
    filter.addEventListener('change', () => {
        currentPage = 1;
        loadAccounts();
    });
});

// 上一页
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadAccounts();
    }
});

// 下一页
nextPageButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalItems / pageSize)) {
        currentPage++;
        loadAccounts();
    }
});

// 初始加载数据
window.onload = () => {
    loadPlatforms();
    loadDevices();
    loadAccountHolders();
    loadAccounts();
};