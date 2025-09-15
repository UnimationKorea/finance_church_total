// 새순 교육부 통합 관리 시스템
// 메인 JavaScript 애플리케이션
console.log('🚀 새순 교육부 관리 시스템 로드됨')

// 앱 버전 정보
const APP_VERSION = '1.0.3'
console.log(`📱 앱 버전: ${APP_VERSION}`)

let currentDepartment = null  // 선택된 부서
let selectedDepartment = null // 동일한 변수를 사용할 수 있도록

// 구분별 항목 정의
const TRANSACTION_ITEMS = {
  '수입': [
    '예산',
    '후원금',
    '특별지원금',
    '이월금',
    '기타'
  ],
  '지출': [
    '교육비',
    '행사비',
    '행정비',
    '전도비',
    '운영비',
    '간식비',
    '심방비',
    '기타'
  ],
  '예산': [
    '년간예산'
  ]
}

// 로컬 스토리지 키
const STORAGE_KEY = 'saesoon_education_data'

// 데이터 저장 및 로드 함수
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('✅ 데이터 저장 완료')
  } catch (error) {
    console.error('❌ 데이터 저장 실패:', error)
    alert('데이터 저장에 실패했습니다.')
  }
}

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { transactions: [], ministries: [], prayers: [] }
  } catch (error) {
    console.error('❌ 데이터 로드 실패:', error)
    return { transactions: [], ministries: [], prayers: [] }
  }
}

// 부서별 데이터 필터링
function getFilteredTransactions() {
  const data = loadData()
  if (!currentDepartment) return data.transactions
  return data.transactions.filter(t => t.department === currentDepartment)
}

function showTab(tabName) {
  console.log('🔄 showTab 호출:', tabName)
  
  // 모든 탭 콘텐츠 숨기기
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden')
  })
  
  // 모든 탭 버튼 비활성화
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-blue-500', 'text-white')
    btn.classList.add('text-gray-600', 'hover:text-blue-600', 'hover:bg-blue-50')
  })
  
  // 선택된 탭 활성화
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`)
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-blue-500', 'text-white')
    activeBtn.classList.remove('text-gray-600', 'hover:text-blue-600', 'hover:bg-blue-50')
  }
  
  // 선택된 탭 콘텐츠 표시
  const activeContent = document.getElementById(`content-${tabName}`)
  if (activeContent) {
    activeContent.classList.remove('hidden')
    console.log('✅ 탭 표시됨:', `content-${tabName}`)
  }
  
  // 탭별 데이터 로드
  if (tabName === 'transactions') {
    loadTransactionsList()
  } else if (tabName === 'reports') {
    loadReports()
  } else if (tabName === 'dashboard') {
    updateDashboard()
  }
}

function loadTransactionsList() {
  console.log('💰 회계관리 데이터 로딩, 부서:', currentDepartment)
  const transactions = getFilteredTransactions()
  renderTransactionsList(transactions)
}

function renderTransactionsList(transactions) {
  console.log('🎨 회계관리 렌더링, 데이터:', transactions.length + '개')
  
  const tbody = document.getElementById('transactions-table-body')
  const noDataMessage = document.getElementById('no-transactions-message')
  
  if (!tbody) {
    console.error('❌ transactions-table-body 요소 없음')
    return
  }
  
  if (!transactions || transactions.length === 0) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-500">등록된 거래가 없습니다.</td></tr>'
    if (noDataMessage) noDataMessage.classList.remove('hidden')
    updateTransactionsSummary([])
    return
  }
  
  if (noDataMessage) noDataMessage.classList.add('hidden')
  
  // 거래 목록 렌더링
  tbody.innerHTML = transactions.map((t, index) => `
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-3">${new Date(t.date).toLocaleDateString('ko-KR')}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs ${t.type === '수입' ? 'bg-green-100 text-green-700' : t.type === '지출' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
          ${t.type}
        </span>
      </td>
      <td class="px-4 py-3">${t.department}</td>
      <td class="px-4 py-3">${t.item}</td>
      <td class="px-4 py-3 text-right font-bold ${t.type === '수입' ? 'text-green-600' : t.type === '지출' ? 'text-red-600' : 'text-blue-600'}">
        ${new Intl.NumberFormat('ko-KR').format(t.amount)}원
      </td>
      <td class="px-4 py-3">${t.manager || '-'}</td>
      <td class="px-4 py-3">${t.memo || '-'}</td>
      <td class="px-4 py-3 text-center">
        <button class="text-red-600 hover:text-red-800 transition-colors" onclick="deleteTransaction(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('')
  
  // 통계 업데이트
  updateTransactionsSummary(transactions)
}

// 거래 추가
function addTransaction(transactionData) {
  const data = loadData()
  const newTransaction = {
    ...transactionData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    department: currentDepartment
  }
  
  data.transactions.push(newTransaction)
  saveData(data)
  
  console.log('✅ 거래 추가됨:', newTransaction)
  return newTransaction
}

// 거래 삭제
function deleteTransaction(index) {
  if (!confirm('이 거래를 삭제하시겠습니까?')) return
  
  const data = loadData()
  const filteredTransactions = getFilteredTransactions()
  
  if (index >= 0 && index < filteredTransactions.length) {
    const transactionToDelete = filteredTransactions[index]
    
    // 전체 데이터에서 해당 거래 찾아서 삭제
    const allTransactionIndex = data.transactions.findIndex(t => 
      t.id === transactionToDelete.id || 
      (t.date === transactionToDelete.date && 
       t.amount === transactionToDelete.amount && 
       t.item === transactionToDelete.item)
    )
    
    if (allTransactionIndex !== -1) {
      data.transactions.splice(allTransactionIndex, 1)
      saveData(data)
      loadTransactionsList()
      updateDashboard()
      showMessage('거래가 삭제되었습니다.', 'success')
    }
  }
}

// 전체 거래 삭제
function deleteAllTransactions() {
  if (!confirm('모든 거래 내역을 삭제하시겠습니까?\\n\\n이 작업은 되돌릴 수 없습니다.')) {
    return
  }
  
  const data = loadData()
  if (currentDepartment) {
    // 현재 부서의 거래만 삭제
    data.transactions = data.transactions.filter(t => t.department !== currentDepartment)
  } else {
    // 모든 거래 삭제
    data.transactions = []
  }
  
  saveData(data)
  loadTransactionsList()
  updateDashboard()
  showMessage('모든 거래가 삭제되었습니다.', 'success')
}

// 통계 업데이트
function updateTransactionsSummary(transactions) {
  console.log('📊 거래 통계 업데이트:', transactions.length + '건')
  
  const totalIncome = transactions.filter(t => t.type === '수입').reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalExpense = transactions.filter(t => t.type === '지출').reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalBudget = transactions.filter(t => t.type === '예산').reduce((sum, t) => sum + (t.amount || 0), 0)
  const balance = totalIncome - totalExpense
  
  // 통계 업데이트
  updateElement('transactions-total-income', `${new Intl.NumberFormat('ko-KR').format(totalIncome)}원`)
  updateElement('transactions-total-expense', `${new Intl.NumberFormat('ko-KR').format(totalExpense)}원`)
  updateElement('transactions-total-budget', `${new Intl.NumberFormat('ko-KR').format(totalBudget)}원`)
  
  const balanceEl = document.getElementById('transactions-balance')
  if (balanceEl) {
    balanceEl.textContent = `${new Intl.NumberFormat('ko-KR').format(balance)}원`
    balanceEl.className = 'text-lg font-bold ' + (balance >= 0 ? 'text-blue-700' : 'text-red-700')
  }
}

// 대시보드 업데이트
function updateDashboard(startDate = null, endDate = null) {
  console.log('📊 대시보드 업데이트')
  
  let transactions = getFilteredTransactions()
  
  // 날짜 필터 적용
  if (startDate || endDate) {
    transactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      if (startDate && transactionDate < new Date(startDate)) return false
      if (endDate && transactionDate > new Date(endDate)) return false
      return true
    })
  }
  
  const totalIncome = transactions.filter(t => t.type === '수입').reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalExpense = transactions.filter(t => t.type === '지출').reduce((sum, t) => sum + (t.amount || 0), 0)
  const balance = totalIncome - totalExpense
  
  // 대시보드 카드 업데이트
  updateElement('total-income', `₩ ${new Intl.NumberFormat('ko-KR').format(totalIncome)}`)
  updateElement('total-expense', `₩ ${new Intl.NumberFormat('ko-KR').format(totalExpense)}`)
  updateElement('transaction-count', `${transactions.length}건`)
  
  const balanceEl = document.getElementById('balance')
  if (balanceEl) {
    balanceEl.textContent = `₩ ${new Intl.NumberFormat('ko-KR').format(balance)}`
    balanceEl.className = 'text-2xl font-bold ' + (balance >= 0 ? 'text-purple-700' : 'text-red-700')
  }
  
  // 기간 표시 업데이트
  updatePeriodDisplay(startDate, endDate)
}

function updatePeriodDisplay(startDate, endDate) {
  const displayEl = document.getElementById('current-period-display')
  if (!displayEl) return
  
  if (startDate && endDate) {
    displayEl.textContent = `${startDate} ~ ${endDate}`
  } else if (startDate) {
    displayEl.textContent = `${startDate} 이후`
  } else if (endDate) {
    displayEl.textContent = `${endDate} 이전`
  } else {
    displayEl.textContent = '전체 기간'
  }
}

// 보고서 로드
function loadReports() {
  console.log('📈 보고서 데이터 로딩')
  const transactions = getFilteredTransactions()
  renderReports(transactions)
}

function renderReports(transactions) {
  const totalIncome = transactions.filter(t => t.type === '수입').reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalExpense = transactions.filter(t => t.type === '지출').reduce((sum, t) => sum + (t.amount || 0), 0)
  const balance = totalIncome - totalExpense
  
  // 보고서 통계 업데이트
  updateElement('report-total-income', `${new Intl.NumberFormat('ko-KR').format(totalIncome)}원`)
  updateElement('report-total-expense', `${new Intl.NumberFormat('ko-KR').format(totalExpense)}원`)
  updateElement('report-total-transactions', `${transactions.length}건`)
  
  const reportBalanceEl = document.getElementById('report-balance')
  if (reportBalanceEl) {
    reportBalanceEl.textContent = `${new Intl.NumberFormat('ko-KR').format(balance)}원`
    reportBalanceEl.className = `text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`
  }
  
  renderRecentTransactions(transactions)
}

function renderRecentTransactions(transactions) {
  const recent = transactions
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 10)
  
  const tbody = document.getElementById('recent-transactions-table')
  if (!tbody) return
  
  tbody.innerHTML = recent.map(t => `
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-3">${new Date(t.date).toLocaleDateString('ko-KR')}</td>
      <td class="px-4 py-3">${t.department}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 rounded-full text-xs ${t.type === '수입' ? 'bg-green-100 text-green-700' : t.type === '지출' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
          ${t.type}
        </span>
      </td>
      <td class="px-4 py-3">${t.item}</td>
      <td class="px-4 py-3 text-right font-bold ${t.type === '수입' ? 'text-green-600' : t.type === '지출' ? 'text-red-600' : 'text-blue-600'}">
        ${new Intl.NumberFormat('ko-KR').format(t.amount)}원
      </td>
      <td class="px-4 py-3">${t.memo || '-'}</td>
    </tr>
  `).join('')
}

// 파일 다운로드 기능
function downloadJsonBackup() {
  console.log('📥 JSON 백업 다운로드 시작')
  const data = loadData()
  const dataStr = JSON.stringify(data, null, 2)
  downloadFile(`saesoon_backup_${new Date().toISOString().split('T')[0]}.json`, dataStr, 'application/json')
}

function downloadCsvData(dataType) {
  console.log('📥 CSV 다운로드 시작:', dataType)
  const data = loadData()
  
  let csvContent = ''
  let fileName = ''
  
  if (dataType === 'transactions') {
    const transactions = currentDepartment ? 
      data.transactions.filter(t => t.department === currentDepartment) : 
      data.transactions
      
    csvContent = convertToCSV(transactions, ['date', 'type', 'department', 'item', 'amount', 'manager', 'memo', 'description'])
    fileName = `transactions_${new Date().toISOString().split('T')[0]}.csv`
  }
  
  if (csvContent) {
    downloadFile(fileName, csvContent, 'text/csv;charset=utf-8')
  }
}

function convertToCSV(data, headers) {
  if (!data || data.length === 0) return ''
  
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || ''
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  })
  
  return csvHeaders + '\\n' + csvRows.join('\\n')
}

function downloadFile(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// 파일 업로드 기능
function handleFileUpload(event, fileType) {
  const file = event.target.files[0]
  if (!file) return
  
  console.log('📤 파일 업로드 시작:', file.name, '크기:', file.size, 'bytes')
  
  // 파일 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showMessage('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.', 'error')
    event.target.value = ''
    return
  }
  
  // 파일 확장자 검증
  const fileName = file.name.toLowerCase()
  if (fileType === 'json' && !fileName.endsWith('.json')) {
    showMessage('JSON 파일(.json)만 업로드 가능합니다.', 'error')
    event.target.value = ''
    return
  }
  
  if (fileType === 'csv' && !fileName.endsWith('.csv')) {
    showMessage('CSV 파일(.csv)만 업로드 가능합니다.', 'error')
    event.target.value = ''
    return
  }
  
  showMessage(`${file.name} 파일을 처리하고 있습니다...`, 'info')
  
  const reader = new FileReader()
  reader.onload = function(e) {
    try {
      const content = e.target.result
      console.log('📄 파일 내용 읽기 완료, 길이:', content.length)
      
      if (fileType === 'json') {
        handleJsonUpload(content)
      } else if (fileType === 'csv') {
        handleCsvUpload(content)
      }
      
    } catch (error) {
      console.error('❌ 파일 처리 오류:', error)
      showMessage(`파일 처리 중 오류가 발생했습니다: ${error.message}`, 'error')
    } finally {
      // 파일 입력 초기화
      event.target.value = ''
    }
  }
  
  reader.onerror = function() {
    console.error('❌ 파일 읽기 오류')
    showMessage('파일을 읽는 중 오류가 발생했습니다.', 'error')
    event.target.value = ''
  }
  
  // UTF-8로 파일 읽기
  reader.readAsText(file, 'UTF-8')
}

function handleJsonUpload(content) {
  try {
    const jsonData = JSON.parse(content)
    
    // 데이터 검증
    if (!jsonData.transactions) {
      throw new Error('올바른 백업 파일이 아닙니다. transactions 데이터가 없습니다.')
    }
    
    // 기존 데이터와 병합 또는 대체
    if (confirm('기존 데이터를 모두 대체하시겠습니까?\\n\\n"취소"를 클릭하면 새 데이터가 기존 데이터에 추가됩니다.')) {
      saveData(jsonData)
    } else {
      const existingData = loadData()
      existingData.transactions = [...existingData.transactions, ...jsonData.transactions]
      saveData(existingData)
    }
    
    showMessage(`JSON 파일 복원 완료! ${jsonData.transactions.length}개의 거래가 처리되었습니다.`, 'success')
    refreshAllData()
  } catch (error) {
    throw new Error('JSON 파일 형식이 올바르지 않습니다: ' + error.message)
  }
}

function handleCsvUpload(content) {
  try {
    console.log('📊 CSV 파일 처리 시작')
    
    // 다양한 줄바꿈 형식 지원 (\n, \r\n, \r)
    const lines = content.split(/\r\n|\r|\n/).filter(line => line.trim())
    console.log('📄 CSV 라인 수:', lines.length)
    
    if (lines.length < 2) {
      throw new Error('CSV 파일에 데이터가 없습니다. 최소한 헤더와 1개의 데이터 행이 필요합니다.')
    }
    
    // 헤더 파싱 - 쉼표로 분할하고 따옴표 제거
    const headerLine = lines[0]
    console.log('📋 헤더 라인:', headerLine)
    
    const headers = parseCSVLine(headerLine)
    console.log('📝 파싱된 헤더:', headers)
    
    // 필수 헤더 확인 (영어/한국어 컬럼명 모두 지원)
    const headerMappings = {
      date: ['date', '날짜', '일자'],
      type: ['type', '구분', '종류', '타입'],
      item: ['item', '항목', '내용'],
      amount: ['amount', '금액', '액수'],
      department: ['department', '부서', '팀'],
      manager: ['manager', '담당자', '관리자'],
      memo: ['memo', '적요', '메모'],
      description: ['description', '설명', '비고', '상세내용']
    }
    
    // 헤더 매핑 함수
    function findHeaderIndex(headerName) {
      const possibleNames = headerMappings[headerName] || []
      return headers.findIndex(header => 
        possibleNames.some(name => 
          header.toLowerCase().trim() === name.toLowerCase() ||
          header.toLowerCase().includes(name.toLowerCase())
        )
      )
    }
    
    // 필수 컬럼 확인
    const requiredFields = ['date', 'type', 'item', 'amount']
    const missingFields = requiredFields.filter(field => findHeaderIndex(field) === -1)
    
    if (missingFields.length > 0) {
      const koreanNames = missingFields.map(field => headerMappings[field] ? headerMappings[field].join('/') : field)
      throw new Error(`필수 컬럼이 누락되었습니다: ${koreanNames.join(', ')}. 현재 헤더: ${headers.join(', ')}`)
    }
    
    const transactions = []
    let processedCount = 0
    let errorCount = 0
    
    // 데이터 행 처리
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i]
        if (!line.trim()) continue
        
        console.log(`🔄 처리 중인 라인 ${i}:`, line)
        
        const values = parseCSVLine(line)
        console.log(`📊 파싱된 값들:`, values)
        
        if (values.length !== headers.length) {
          console.warn(`⚠️ 라인 ${i}: 컬럼 수 불일치 (헤더: ${headers.length}, 데이터: ${values.length})`)
          errorCount++
          continue
        }
        
        // 헤더 매핑을 사용한 데이터 파싱
        const transaction = {}
        
        // 각 필드의 인덱스 찾기
        const dateIndex = findHeaderIndex('date')
        const typeIndex = findHeaderIndex('type')
        const itemIndex = findHeaderIndex('item')
        const amountIndex = findHeaderIndex('amount')
        const departmentIndex = findHeaderIndex('department')
        const managerIndex = findHeaderIndex('manager')
        const memoIndex = findHeaderIndex('memo')
        const descriptionIndex = findHeaderIndex('description')
        
        // 필수 필드 검증 및 변환
        const dateValue = dateIndex >= 0 ? values[dateIndex]?.trim() : ''
        const typeValue = typeIndex >= 0 ? values[typeIndex]?.trim() : ''
        let itemValue = itemIndex >= 0 ? values[itemIndex]?.trim() : ''
        const amountValue = amountIndex >= 0 ? values[amountIndex]?.trim() : ''
        
        if (!dateValue || !typeValue || !itemValue || !amountValue) {
          console.warn(`⚠️ 라인 ${i}: 필수 필드 누락`, { dateValue, typeValue, itemValue, amountValue })
          errorCount++
          continue
        }
        
        // 날짜 형식 검증
        const dateObj = new Date(dateValue)
        if (isNaN(dateObj.getTime())) {
          console.warn(`⚠️ 라인 ${i}: 잘못된 날짜 형식:`, dateValue)
          errorCount++
          continue
        }
        
        // 금액 변환
        const numericAmount = parseFloat(String(amountValue).replace(/[^0-9.-]/g, ''))
        if (isNaN(numericAmount)) {
          console.warn(`⚠️ 라인 ${i}: 잘못된 금액 형식:`, amountValue)
          errorCount++
          continue
        }
        
        // 거래 유형 정규화
        let normalizedType = typeValue
        if (typeValue.includes('수입') || typeValue.includes('입금') || typeValue.includes('income')) {
          normalizedType = '수입'
        } else if (typeValue.includes('지출') || typeValue.includes('출금') || typeValue.includes('expense')) {
          normalizedType = '지출'
        } else if (typeValue.includes('예산') || typeValue.includes('budget')) {
          normalizedType = '예산'
        }
        
        // 항목 매핑 및 검증
        let normalizedItem = itemValue
        if (normalizedType && TRANSACTION_ITEMS[normalizedType]) {
          // 항목이 정의된 목록에 있는지 확인
          const availableItems = TRANSACTION_ITEMS[normalizedType]
          
          // 정확히 일치하는 항목 찾기
          if (!availableItems.includes(itemValue)) {
            // 부분 매칭 시도 (예: "헌금" -> "주일헌금")
            const matchedItem = availableItems.find(item => 
              item.includes(itemValue) || itemValue.includes(item)
            )
            
            if (matchedItem) {
              normalizedItem = matchedItem
              console.log(`📝 항목 매핑: "${itemValue}" -> "${matchedItem}"`)
            } else {
              // 매칭되지 않으면 '기타' 항목으로 처리
              const otherItems = availableItems.filter(item => item.includes('기타'))
              if (otherItems.length > 0) {
                normalizedItem = otherItems[0]
                console.log(`⚠️ 알 수 없는 항목 "${itemValue}" -> "${otherItems[0]}"로 매핑`)
              }
            }
          }
        }
        
        const processedTransaction = {
          date: dateObj.toISOString().split('T')[0],
          type: normalizedType,
          department: (departmentIndex >= 0 ? values[departmentIndex]?.trim() : '') || currentDepartment || '기타',
          item: normalizedItem,
          amount: numericAmount,
          manager: managerIndex >= 0 ? values[managerIndex]?.trim() || '' : '',
          memo: memoIndex >= 0 ? values[memoIndex]?.trim() || '' : '',
          description: descriptionIndex >= 0 ? values[descriptionIndex]?.trim() || '' : '',
          id: `csv_${Date.now()}_${i}`,
          createdAt: new Date().toISOString()
        }
        
        transactions.push(processedTransaction)
        processedCount++
        console.log(`✅ 거래 ${processedCount} 처리 완료:`, processedTransaction)
        
      } catch (lineError) {
        console.error(`❌ 라인 ${i} 처리 오류:`, lineError)
        errorCount++
      }
    }
    
    console.log(`📊 CSV 처리 완료: 성공 ${processedCount}건, 오류 ${errorCount}건`)
    
    if (transactions.length === 0) {
      throw new Error(`처리 가능한 데이터가 없습니다. 총 ${lines.length - 1}개 라인 중 ${errorCount}개에서 오류 발생`)
    }
    
    // 기존 데이터에 추가
    const existingData = loadData()
    existingData.transactions = [...existingData.transactions, ...transactions]
    saveData(existingData)
    
    let resultMessage = `CSV 파일 가져오기 완료! ${transactions.length}개의 거래가 추가되었습니다.`
    if (errorCount > 0) {
      resultMessage += ` (${errorCount}개 행에서 오류 발생)`
    }
    
    showMessage(resultMessage, 'success')
    refreshAllData()
    
  } catch (error) {
    console.error('❌ CSV 처리 전체 오류:', error)
    showMessage(`CSV 파일 처리 중 오류가 발생했습니다: ${error.message}`, 'error')
  }
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes) {
        // 따옴표 안에서 다음 문자가 또 따옴표인지 확인 (escaped quote)
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i += 2 // 두 문자 모두 건너뛰기
          continue
        } else {
          // 따옴표 끝
          inQuotes = false
        }
      } else {
        // 따옴표 시작
        inQuotes = true
      }
    } else if (char === ',' && !inQuotes) {
      // 쉼표 구분자 (따옴표 밖에서만)
      result.push(current.trim().replace(/^"|"$/g, '')) // 시작과 끝 따옴표 제거
      current = ''
    } else {
      current += char
    }
    
    i++
  }
  
  // 마지막 필드 추가
  result.push(current.trim().replace(/^"|"$/g, ''))
  
  return result.map(field => field.trim())
}

// 메시지 표시
function showMessage(message, type = 'info') {
  const container = document.getElementById('message-container')
  if (!container) return
  
  const messageEl = document.createElement('div')
  messageEl.className = `px-4 py-3 rounded-lg shadow-lg message-slide-in ${
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
    'bg-blue-100 text-blue-800 border border-blue-200'
  }`
  
  messageEl.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
  
  container.appendChild(messageEl)
  
  // 3초 후 자동 제거
  setTimeout(() => {
    if (messageEl.parentElement) {
      messageEl.remove()
    }
  }, 3000)
}

// 모든 데이터 새로고침
function refreshAllData() {
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab
  
  if (activeTab === 'transactions') {
    loadTransactionsList()
  } else if (activeTab === 'dashboard') {
    updateDashboard()
  } else if (activeTab === 'reports') {
    loadReports()
  }
  
  // 대시보드는 항상 업데이트
  updateDashboard()
}

// 유틸리티 함수
function updateElement(id, content) {
  const element = document.getElementById(id)
  if (element) element.textContent = content
}

// 부서 선택 후 메인 앱 시작
function selectDepartment(department) {
  console.log('🏢 부서 선택:', department)
  
  currentDepartment = department
  selectedDepartment = department
  
  // 부서 선택 페이지 숨기기
  document.getElementById('department-selection').style.display = 'none'
  
  // 메인 컨텐츠 표시
  document.getElementById('main-content').classList.remove('hidden')
  
  // 헤더에 선택된 부서 표시
  updateElement('current-department', department)
  
  // 앱 초기화
  initializeApp()
}

// 부서 변경
function changeDepartment() {
  document.getElementById('main-content').classList.add('hidden')
  document.getElementById('department-selection').style.display = 'block'
  currentDepartment = null
  selectedDepartment = null
}

// 앱 초기화
function initializeApp() {
  console.log('🚀 앱 초기화, 선택된 부서:', currentDepartment)
  
  // 탭 버튼 이벤트 리스너
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      showTab(this.dataset.tab)
    })
  })
  
  // 부서 변경 버튼
  document.getElementById('change-department')?.addEventListener('click', changeDepartment)
  
  // 파일 관리 이벤트
  setupFileManagement()
  
  // 거래 폼 이벤트
  setupTransactionForm()
  
  // 기간 선택 이벤트
  setupDateRange()
  
  // 기본 탭 표시
  showTab('dashboard')
}

// 구분에 따른 항목 업데이트
function updateTransactionItems(transactionType) {
  const itemSelect = document.getElementById('transaction-item')
  if (!itemSelect) return
  
  // 기존 옵션 제거
  itemSelect.innerHTML = '<option value="">항목을 선택하세요</option>'
  
  if (transactionType && TRANSACTION_ITEMS[transactionType]) {
    TRANSACTION_ITEMS[transactionType].forEach(item => {
      const option = document.createElement('option')
      option.value = item
      option.textContent = item
      itemSelect.appendChild(option)
    })
    
    // 예산의 경우 자동으로 '년간예산' 선택
    if (transactionType === '예산') {
      itemSelect.value = '년간예산'
      itemSelect.disabled = true  // 예산은 선택 불가
      console.log('✅ 예산 - 년간예산 자동 선택됨')
    } else {
      itemSelect.disabled = false
      console.log(`✅ ${transactionType} 항목 ${TRANSACTION_ITEMS[transactionType].length}개 로드됨`)
    }
  } else {
    // 구분이 선택되지 않으면 비활성화
    itemSelect.disabled = true
    console.log('⚠️ 구분을 먼저 선택해주세요')
  }
}

// 거래 폼 설정
function setupTransactionForm() {
  const form = document.getElementById('transaction-form')
  if (!form) return
  
  // 현재 날짜 기본값 설정
  const dateInput = document.getElementById('transaction-date')
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0]
  }
  
  // 구분 선택 시 항목 업데이트
  const typeSelect = document.getElementById('transaction-type')
  const itemSelect = document.getElementById('transaction-item')
  
  if (typeSelect && itemSelect) {
    // 초기에는 항목 선택 비활성화
    itemSelect.disabled = true
    
    typeSelect.addEventListener('change', function() {
      const selectedType = this.value
      updateTransactionItems(selectedType)
    })
  }
  
  form.addEventListener('submit', function(e) {
    e.preventDefault()
    
    const formData = {
      date: document.getElementById('transaction-date').value,
      type: document.getElementById('transaction-type').value,
      item: document.getElementById('transaction-item').value,
      amount: parseFloat(document.getElementById('transaction-amount').value) || 0,
      manager: document.getElementById('transaction-manager').value,
      memo: document.getElementById('transaction-memo').value,
      description: document.getElementById('transaction-description').value
    }
    
    if (!formData.date || !formData.type || !formData.item || !formData.amount) {
      showMessage('필수 필드를 모두 입력해주세요.', 'error')
      return
    }
    
    addTransaction(formData)
    form.reset()
    
    // 날짜 기본값 다시 설정
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0]
    }
    
    loadTransactionsList()
    updateDashboard()
    showMessage('거래가 성공적으로 추가되었습니다.', 'success')
  })
  
  // 폼 초기화 버튼
  document.getElementById('clear-transaction-form')?.addEventListener('click', function() {
    form.reset()
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0]
    }
  })
  
  // 새로고침 버튼
  document.getElementById('refresh-transactions')?.addEventListener('click', loadTransactionsList)
  
  // 전체 삭제 버튼
  document.getElementById('delete-all-transactions')?.addEventListener('click', deleteAllTransactions)
}

// 파일 관리 설정
function setupFileManagement() {
  // 다운로드 버튼들
  document.getElementById('download-json-btn')?.addEventListener('click', downloadJsonBackup)
  document.getElementById('download-csv-transactions')?.addEventListener('click', () => downloadCsvData('transactions'))
  
  // 파일 입력 이벤트
  const jsonFileInput = document.getElementById('json-file-input')
  const csvFileInput = document.getElementById('csv-file-input')
  const uploadJsonBtn = document.getElementById('upload-json-btn')
  const uploadCsvBtn = document.getElementById('upload-csv-btn')
  
  if (jsonFileInput) {
    jsonFileInput.addEventListener('change', function(e) {
      if (uploadJsonBtn) uploadJsonBtn.disabled = !e.target.files[0]
    })
  }
  
  if (csvFileInput) {
    csvFileInput.addEventListener('change', function(e) {
      if (uploadCsvBtn) uploadCsvBtn.disabled = !e.target.files[0]
    })
  }
  
  if (uploadJsonBtn) {
    uploadJsonBtn.addEventListener('click', function() {
      if (jsonFileInput && jsonFileInput.files[0]) {
        handleFileUpload({ target: jsonFileInput }, 'json')
      }
    })
  }
  
  if (uploadCsvBtn) {
    uploadCsvBtn.addEventListener('click', function() {
      if (csvFileInput && csvFileInput.files[0]) {
        handleFileUpload({ target: csvFileInput }, 'csv')
      }
    })
  }
}

// 기간 선택 설정
function setupDateRange() {
  // 빠른 기간 선택 버튼
  document.querySelectorAll('.quick-date-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const period = this.dataset.period
      
      // 모든 버튼 비활성화
      document.querySelectorAll('.quick-date-btn').forEach(b => {
        b.classList.remove('active', 'bg-blue-600', 'text-white')
        b.classList.add('bg-gray-100', 'text-gray-700')
      })
      
      // 현재 버튼 활성화
      this.classList.remove('bg-gray-100', 'text-gray-700')
      this.classList.add('active', 'bg-blue-600', 'text-white')
      
      const dates = calculatePeriodDates(period)
      
      // 날짜 입력 필드 업데이트
      const startDateInput = document.getElementById('start-date')
      const endDateInput = document.getElementById('end-date')
      
      if (startDateInput) startDateInput.value = dates.start
      if (endDateInput) endDateInput.value = dates.end
      
      updateDashboard(dates.start, dates.end)
    })
  })
  
  // 조회 버튼
  document.getElementById('apply-date-range')?.addEventListener('click', function() {
    const startDate = document.getElementById('start-date')?.value
    const endDate = document.getElementById('end-date')?.value
    
    // 빠른 선택 버튼 비활성화
    document.querySelectorAll('.quick-date-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-blue-600', 'text-white')
      btn.classList.add('bg-gray-100', 'text-gray-700')
    })
    
    updateDashboard(startDate, endDate)
  })
}

function calculatePeriodDates(period) {
  const today = new Date()
  let startDate, endDate
  
  switch (period) {
    case '1month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      break
    case '3months':
      startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      break
    case '6months':
      startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      break
    case '1year':
      startDate = new Date(today.getFullYear(), 0, 1)
      endDate = new Date(today.getFullYear(), 11, 31)
      break
    default:
      startDate = today
      endDate = today
  }
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  }
}

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM 로드 완료')
  
  // 부서 선택 버튼 이벤트 리스너
  document.querySelectorAll('.department-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      selectDepartment(this.dataset.department)
    })
  })
  
  console.log('✅ 부서 버튼 이벤트 리스너 설정 완료')
})