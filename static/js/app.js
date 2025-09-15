        // 인라인 JavaScript로 직접 탭 기능 구현
        console.log('🚀 인라인 JavaScript 로드됨')
        
        let currentDepartment = null  // 선택된 부서
        let selectedDepartment = null // 동일한 변수를 사용할 수 있도록
        
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
        
        async function loadTransactionsList() {
          console.log('💰 회계관리 데이터 로딩, 부서:', currentDepartment)
          try {
            // 선택된 부서의 데이터만 가져오기
            const url = currentDepartment ? '/api/transactions?department=' + encodeURIComponent(currentDepartment) : '/api/transactions'
            const response = await fetch(url)
            const result = await response.json()
            
            if (result.success) {
              console.log('✅ 거래 데이터 로드 성공:', result.data.length + '건')
              renderTransactionsList(result.data)
            } else {
              console.error('❌ 거래 데이터 로드 실패:', result.message)
            }
          } catch (error) {
            console.error('회계관리 로드 오류:', error)
          }
        }
        
        function renderTransactionsList(transactions) {
          console.log('🎨 회계관리 렌더링, 데이터:', transactions.length + '개')
          
          const tbody = document.getElementById('transactions-table-body')
          if (!tbody) {
            console.error('❌ transactions-table-body 요소 없음')
            return
          }
          
          if (!transactions || transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">등록된 거래가 없습니다.</td></tr>'
            updateTransactionsSummary([])
            return
          }
          
          // 사용자 선택 정렬 적용
          const sortedTransactions = [...transactions].sort((a, b) => {
            let valueA, valueB
            
            switch (sortField) {
              case 'date':
                valueA = new Date(a.createdAt || a.date)
                valueB = new Date(b.createdAt || b.date)
                break
              case 'amount':
                valueA = a.amount
                valueB = b.amount
                break
              default:
                valueA = new Date(a.createdAt || a.date)
                valueB = new Date(b.createdAt || b.date)
            }
            
            if (sortDirection === 'desc') {
              return valueB - valueA
            } else {
              return valueA - valueB
            }
          })
          
          tbody.innerHTML = sortedTransactions.map(t => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">${new Date(t.date).toLocaleDateString('ko-KR')}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs ${t.type === '수입' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                  ${t.type}
                </span>
              </td>
              <td class="px-4 py-3">${t.department}</td>
              <td class="px-4 py-3">${t.item}</td>
              <td class="px-4 py-3 text-right font-bold ${t.type === '수입' ? 'text-green-600' : 'text-red-600'}">
                ${new Intl.NumberFormat('ko-KR').format(t.amount)}원
              </td>
              <td class="px-4 py-3">${t.manager || '-'}</td>
              <td class="px-4 py-3 text-center">
                <button class="text-red-600 hover:text-red-800" onclick="deleteTransaction('${t.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')
          
          // 통계 업데이트
          updateTransactionsSummary(sortedTransactions)
        }
        
        // 전체 거래 삭제 함수
        async function deleteAllTransactions() {
          if (!confirm('모든 거래 내역을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
            return
          }
          
          try {
            const response = await fetch('/api/transactions/all', { method: 'DELETE' })
            const result = await response.json()
            
            if (result.success) {
              alert('모든 거래가 성공적으로 삭제되었습니다.')
              loadTransactionsList()
              updateDashboard() // 대시보드도 업데이트
            } else {
              alert('삭제 실패: ' + result.message)
            }
          } catch (error) {
            console.error('전체 삭제 오류:', error)
            alert('전체 삭제 중 오류가 발생했습니다.')
          }
        }
        
        // 거래 정렬 변수
        let sortField = 'createdAt'
        let sortDirection = 'desc' // desc: 내림차순, asc: 오름차순
        
        // 거래 정렬 함수
        function sortTransactions(field) {
          console.log('🔄 거래 정렬:', field)
          
          // 같은 필드를 클릭하면 정렬 방향 토글
          if (sortField === field) {
            sortDirection = sortDirection === 'desc' ? 'asc' : 'desc'
          } else {
            sortField = field
            sortDirection = 'desc' // 새 필드는 기본적으로 내림차순
          }
          
          // 아이콘 업데이트
          updateSortIcons()
          
          // 거래 목록 다시 로드
          loadTransactionsList()
        }
        
        // 정렬 아이콘 업데이트
        function updateSortIcons() {
          // 모든 정렬 아이콘 초기화
          document.getElementById('sort-date-icon')?.setAttribute('class', 'fas fa-sort ml-1')
          document.getElementById('sort-amount-icon')?.setAttribute('class', 'fas fa-sort ml-1')
          
          // 현재 정렬 필드의 아이콘 업데이트
          const iconId = 'sort-' + sortField + '-icon'
          const icon = document.getElementById(iconId)
          if (icon) {
            icon.setAttribute('class', 'fas fa-sort-' + (sortDirection === 'desc' ? 'down' : 'up') + ' ml-1')
          }
        }
        
        // 거래 통계 업데이트 함수
        function updateTransactionsSummary(transactions) {
          console.log('📊 거래 통계 업데이트:', transactions.length + '건')
          
          const totalIncome = transactions.filter(t => t.type === '수입').reduce((sum, t) => sum + t.amount, 0)
          const totalExpense = transactions.filter(t => t.type === '지출').reduce((sum, t) => sum + t.amount, 0)
          const totalBudget = transactions.filter(t => t.type === '예산').reduce((sum, t) => sum + t.amount, 0)
          const balance = totalIncome - totalExpense
          
          // 기존 통계 섹션 업데이트
          const incomeEl = document.getElementById('transactions-total-income')
          const expenseEl = document.getElementById('transactions-total-expense')
          const budgetEl = document.getElementById('transactions-total-budget')
          const balanceEl = document.getElementById('transactions-balance')
          
          if (incomeEl) incomeEl.textContent = new Intl.NumberFormat('ko-KR').format(totalIncome) + '원'
          if (expenseEl) expenseEl.textContent = new Intl.NumberFormat('ko-KR').format(totalExpense) + '원'
          if (budgetEl) budgetEl.textContent = new Intl.NumberFormat('ko-KR').format(totalBudget) + '원'
          if (balanceEl) {
            balanceEl.textContent = new Intl.NumberFormat('ko-KR').format(balance) + '원'
            balanceEl.className = 'text-lg font-bold ' + (balance >= 0 ? 'text-blue-700' : 'text-red-700')
          }
          
          // 회계관리 탭 내 대시보드 업데이트
          updateTransactionsDashboard(transactions)
          
          console.log('✅ 통계 업데이트 완료 - 수입:', totalIncome, '지출:', totalExpense, '잔액:', balance)
        }
        
        // 회계관리 탭 내 대시보드 업데이트
        function updateTransactionsDashboard(transactions) {
          console.log('📈 회계관리 대시보드 업데이트:', transactions.length + '건')
          
          const totalIncome = transactions.filter(t => t.type === '수입').reduce((sum, t) => sum + t.amount, 0)
          const totalExpense = transactions.filter(t => t.type === '지출').reduce((sum, t) => sum + t.amount, 0)
          const totalBudget = transactions.filter(t => t.type === '예산').reduce((sum, t) => sum + t.amount, 0)
          const balance = totalIncome - totalExpense
          
          // 대시보드 카드 업데이트
          const dashIncomeEl = document.getElementById('transactions-dashboard-income')
          const dashExpenseEl = document.getElementById('transactions-dashboard-expense')
          const dashBudgetEl = document.getElementById('transactions-dashboard-budget')
          const dashBalanceEl = document.getElementById('transactions-dashboard-balance')
          const lastUpdatedEl = document.getElementById('transactions-last-updated')
          
          if (dashIncomeEl) dashIncomeEl.textContent = '₩ ' + new Intl.NumberFormat('ko-KR').format(totalIncome)
          if (dashExpenseEl) dashExpenseEl.textContent = '₩ ' + new Intl.NumberFormat('ko-KR').format(totalExpense)
          if (dashBudgetEl) dashBudgetEl.textContent = '₩ ' + new Intl.NumberFormat('ko-KR').format(totalBudget)
          if (dashBalanceEl) {
            dashBalanceEl.textContent = '₩ ' + new Intl.NumberFormat('ko-KR').format(balance)
            dashBalanceEl.className = 'text-2xl font-bold ' + (balance >= 0 ? 'text-purple-700' : 'text-red-700')
          }
          if (lastUpdatedEl) {
            const now = new Date()
            lastUpdatedEl.textContent = now.toLocaleTimeString('ko-KR') + ' 업데이트'
          }
          
          // 부서별 통계 업데이트
          updateDepartmentSummary(transactions)
          
          // 최근 거래 목록 업데이트
          updateRecentTransactionsList(transactions)
          
          // 월별 차트 업데이트 (간단한 버전)
          updateMonthlyChart(transactions)
        }
        
        // 부서별 통계 업데이트
        function updateDepartmentSummary(transactions) {
          const deptStats = {}
          
          // 각 부서별 통계 계산
          const departments = ['유아부', '유치부', '유년부', '초등부', '중등부', '고등부', '영어예배부']
          departments.forEach(dept => {
            deptStats[dept] = { income: 0, expense: 0, budget: 0, count: 0 }
          })
          
          transactions.forEach(t => {
            if (deptStats[t.department]) {
              if (t.type === '수입') deptStats[t.department].income += t.amount
              else if (t.type === '지출') deptStats[t.department].expense += t.amount
              else if (t.type === '예산') deptStats[t.department].budget += t.amount
              deptStats[t.department].count++
            }
          })
          
          const tbody = document.getElementById('transactions-dept-summary')
          if (!tbody) return
          
          tbody.innerHTML = Object.entries(deptStats).map(([dept, stats]) => {
            const balance = stats.income - stats.expense
            if (stats.count === 0) return '' // 데이터가 없는 부서는 표시하지 않음
            
            return '<tr class="hover:bg-gray-50">' +
              '<td class="px-3 py-2 font-medium">' + dept + '</td>' +
              '<td class="px-3 py-2 text-right text-green-600 font-bold">' + new Intl.NumberFormat('ko-KR').format(stats.income) + '</td>' +
              '<td class="px-3 py-2 text-right text-red-600 font-bold">' + new Intl.NumberFormat('ko-KR').format(stats.expense) + '</td>' +
              '<td class="px-3 py-2 text-right font-bold ' + (balance >= 0 ? 'text-blue-600' : 'text-red-600') + '">' + new Intl.NumberFormat('ko-KR').format(balance) + '</td>' +
            '</tr>'
          }).filter(row => row !== '').join('')
        }
        
        // 최근 거래 목록 업데이트
        function updateRecentTransactionsList(transactions) {
          const recent = [...transactions]
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5)
          
          const listEl = document.getElementById('transactions-recent-list')
          if (!listEl) return
          
          if (recent.length === 0) {
            listEl.innerHTML = '<div class="text-center py-4 text-gray-500">최근 거래가 없습니다</div>'
            return
          }
          
          listEl.innerHTML = recent.map(t => 
            '<div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">' +
              '<div class="flex-1">' +
                '<div class="font-medium text-sm">' + t.item + '</div>' +
                '<div class="text-xs text-gray-500">' + t.department + ' · ' + new Date(t.date).toLocaleDateString('ko-KR') + '</div>' +
              '</div>' +
              '<div class="text-right">' +
                '<div class="font-bold text-sm ' + (t.type === '수입' ? 'text-green-600' : t.type === '지출' ? 'text-red-600' : 'text-blue-600') + '">' +
                  (t.type === '지출' ? '-' : '+') + new Intl.NumberFormat('ko-KR').format(t.amount) + '원' +
                '</div>' +
                '<div class="text-xs text-gray-500">' + t.type + '</div>' +
              '</div>' +
            '</div>'
          ).join('')
        }
        
        // 간단한 월별 차트 (텍스트 기반)
        function updateMonthlyChart(transactions) {
          const chartEl = document.getElementById('transactions-monthly-chart')
          if (!chartEl) return
          
          // 간단한 텍스트 기반 차트로 대체 (Chart.js 없이)
          const monthlyData = {}
          
          transactions.forEach(t => {
            const month = t.date.substring(0, 7) // YYYY-MM
            if (!monthlyData[month]) {
              monthlyData[month] = { income: 0, expense: 0 }
            }
            if (t.type === '수입') monthlyData[month].income += t.amount
            else if (t.type === '지출') monthlyData[month].expense += t.amount
          })
          
          const months = Object.keys(monthlyData).sort().slice(-6) // 최근 6개월
          
          if (months.length === 0) {
            chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">데이터가 없습니다</div>'
            return
          }
          
          const maxAmount = Math.max(
            ...months.map(month => Math.max(monthlyData[month].income, monthlyData[month].expense))
          )
          
          chartEl.innerHTML = '<div class="space-y-4">' +
            months.map(month => {
              const data = monthlyData[month]
              const incomeWidth = maxAmount > 0 ? (data.income / maxAmount) * 100 : 0
              const expenseWidth = maxAmount > 0 ? (data.expense / maxAmount) * 100 : 0
              
              return '<div class="space-y-2">' +
                '<div class="text-sm font-medium text-gray-700">' + month + '</div>' +
                '<div class="space-y-1">' +
                  '<div class="flex items-center space-x-2">' +
                    '<div class="w-12 text-xs text-green-600">수입</div>' +
                    '<div class="flex-1 bg-gray-200 rounded-full h-4">' +
                      '<div class="bg-green-500 h-4 rounded-full" style="width: ' + incomeWidth + '%"></div>' +
                    '</div>' +
                    '<div class="w-20 text-xs text-right text-green-600">' + new Intl.NumberFormat('ko-KR').format(data.income) + '</div>' +
                  '</div>' +
                  '<div class="flex items-center space-x-2">' +
                    '<div class="w-12 text-xs text-red-600">지출</div>' +
                    '<div class="flex-1 bg-gray-200 rounded-full h-4">' +
                      '<div class="bg-red-500 h-4 rounded-full" style="width: ' + expenseWidth + '%"></div>' +
                    '</div>' +
                    '<div class="w-20 text-xs text-right text-red-600">' + new Intl.NumberFormat('ko-KR').format(data.expense) + '</div>' +
                  '</div>' +
                '</div>' +
              '</div>'
            }).join('') +
          '</div>'
        }
        
        async function loadReports() {
          console.log('📈 보고서 데이터 로딩, 부서:', currentDepartment)
          try {
            // 선택된 부서의 데이터만 가져오기
            const url = currentDepartment ? '/api/transactions?department=' + encodeURIComponent(currentDepartment) : '/api/transactions'
            const response = await fetch(url)
            const result = await response.json()
            
            if (result.success) {
              renderReports(result.data)
            }
          } catch (error) {
            console.error('보고서 로드 오류:', error)
          }
        }
        
        function renderReports(transactions) {
          console.log('🎨 보고서 렌더링, 데이터:', transactions.length + '개')
          
          const totalIncome = transactions.filter(t => t.type === '수입').reduce((sum, t) => sum + t.amount, 0)
          const totalExpense = transactions.filter(t => t.type === '지출').reduce((sum, t) => sum + t.amount, 0)
          const balance = totalIncome - totalExpense
          
          // 전체 통계 업데이트
          const incomeEl = document.getElementById('report-total-income')
          const expenseEl = document.getElementById('report-total-expense')
          const balanceEl = document.getElementById('report-balance')
          const countEl = document.getElementById('report-total-transactions')
          
          if (incomeEl) incomeEl.textContent = new Intl.NumberFormat('ko-KR').format(totalIncome) + '원'
          if (expenseEl) expenseEl.textContent = new Intl.NumberFormat('ko-KR').format(totalExpense) + '원'
          if (balanceEl) {
            balanceEl.textContent = new Intl.NumberFormat('ko-KR').format(balance) + '원'
            balanceEl.className = `text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`
          }
          if (countEl) countEl.textContent = transactions.length + '건'
          
          // 부서별 요약 렌더링
          renderDepartmentsSummary(transactions)
          renderRecentTransactions(transactions)
        }
        
        function renderDepartmentsSummary(transactions) {
          const departmentStats = {}
          
          transactions.forEach(t => {
            if (!departmentStats[t.department]) {
              departmentStats[t.department] = { income: 0, expense: 0, count: 0 }
            }
            
            if (t.type === '수입') {
              departmentStats[t.department].income += t.amount
            } else if (t.type === '지출') {
              departmentStats[t.department].expense += t.amount
            }
            departmentStats[t.department].count++
          })
          
          const tbody = document.getElementById('departments-summary-table')
          if (!tbody) return
          
          tbody.innerHTML = Object.entries(departmentStats).map(([dept, stats]) => {
            const balance = stats.income - stats.expense
            return `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium">${dept}</td>
                <td class="px-4 py-3 text-right text-green-600 font-bold">${new Intl.NumberFormat('ko-KR').format(stats.income)}원</td>
                <td class="px-4 py-3 text-right text-red-600 font-bold">${new Intl.NumberFormat('ko-KR').format(stats.expense)}원</td>
                <td class="px-4 py-3 text-right font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}">${new Intl.NumberFormat('ko-KR').format(balance)}원</td>
                <td class="px-4 py-3 text-center">${stats.count}건</td>
              </tr>
            `
          }).join('')
        }
        
        function renderRecentTransactions(transactions) {
          const recent = transactions.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 10)
          
          const tbody = document.getElementById('recent-transactions-table')
          if (!tbody) return
          
          tbody.innerHTML = recent.map(t => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">${new Date(t.date).toLocaleDateString('ko-KR')}</td>
              <td class="px-4 py-3">${t.department}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs ${t.type === '수입' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                  ${t.type}
                </span>
              </td>
              <td class="px-4 py-3">${t.item}</td>
              <td class="px-4 py-3 text-right font-bold ${t.type === '수입' ? 'text-green-600' : 'text-red-600'}">
                ${new Intl.NumberFormat('ko-KR').format(t.amount)}원
              </td>
            </tr>
          `).join('')
        }
        
        async function deleteTransaction(id) {
          if (!confirm('이 거래를 삭제하시겠습니까?')) return
          
          try {
            const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
            const result = await response.json()
            
            if (result.success) {
              alert('거래가 삭제되었습니다.')
              loadTransactionsList()
              updateDashboard() // 대시보드도 업데이트
            }
          } catch (error) {
            console.error('삭제 오류:', error)
            alert('삭제 실패')
          }
        }
        
        // 대시보드 업데이트 함수
        async function updateDashboard(startDate = null, endDate = null) {
          console.log('📊 대시보드 업데이트', { startDate, endDate, department: currentDepartment })
          
          try {
            // API 요청 URL 구성
            let url = '/api/summary'
            const params = new URLSearchParams()
            
            // 선택된 부서 필터
            if (currentDepartment) {
              params.append('department', currentDepartment)
            }
            
            // 날짜 필터
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)
            
            if (params.toString()) {
              url += '?' + params.toString()
            }
            
            const response = await fetch(url)
            const result = await response.json()
            
            if (result.success) {
              const data = result.data
              console.log('✅ 대시보드 데이터 로드 성공:', data)
              
              // 대시보드 카드 업데이트
              updateDashboardCards(data)
              
              // 기간 표시 업데이트
              updatePeriodDisplay(startDate, endDate)
              
            } else {
              console.error('❌ 대시보드 데이터 로드 실패:', result.message)
            }
          } catch (error) {
            console.error('❌ 대시보드 업데이트 오류:', error)
          }
        }
        
        // 대시보드 카드 업데이트
        function updateDashboardCards(data) {
          // 수입 카드
          const incomeEl = document.getElementById('total-income')
          if (incomeEl) {
            incomeEl.textContent = '₩ ' + new Intl.NumberFormat('ko-KR').format(data.totalIncome || 0)
          }
          
          // 지출 카드
          const expenseEl = document.getElementById('total-expense')
          if (expenseEl) {
            expenseEl.textContent = '₩ ' + new Intl.NumberFormat('ko-KR').format(data.totalExpense || 0)
          }
          
          // 잔액 카드
          const balanceEl = document.getElementById('balance')
          if (balanceEl) {
            balanceEl.textContent = '₩ ' + new Intl.NumberFormat('ko-KR').format(data.balance || 0)
            balanceEl.className = 'text-2xl font-bold ' + (data.balance >= 0 ? 'text-purple-700' : 'text-red-700')
          }
          
          // 거래 건수 카드
          const countEl = document.getElementById('transaction-count')
          if (countEl) {
            countEl.textContent = (data.transactionCount || 0) + '건'
          }
        }
        
        // 기간 표시 업데이트
        function updatePeriodDisplay(startDate, endDate) {
          const displayEl = document.getElementById('current-period-display')
          if (!displayEl) return
          
          if (startDate && endDate) {
            displayEl.textContent = startDate + ' ~ ' + endDate
          } else if (startDate) {
            displayEl.textContent = startDate + ' 이후'
          } else if (endDate) {
            displayEl.textContent = endDate + ' 이전'
          } else {
            displayEl.textContent = '전체 기간'
          }
        }
        
        // 기간 버튼 설정
        function setupPeriodButtons() {
          console.log('📅 기간 버튼 설정')
          
          document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              const period = this.dataset.period
              console.log('🖱️ 기간 버튼 클릭:', period)
              
              // 모든 기간 버튼 비활성화
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
              
              // 대시보드 업데이트
              updateDashboard(dates.start, dates.end)
            })
          })
        }
        
        // 날짜 범위 이벤트 설정
        function setupDateRangeEvents() {
          console.log('📅 날짜 범위 이벤트 설정')
          
          // 조회 버튼 클릭
          document.getElementById('apply-date-range')?.addEventListener('click', function() {
            const startDate = document.getElementById('start-date')?.value
            const endDate = document.getElementById('end-date')?.value
            
            console.log('🔍 날짜 범위 조회:', { startDate, endDate })
            
            // 기간 버튼 비활성화
            document.querySelectorAll('.quick-date-btn').forEach(btn => {
              btn.classList.remove('active', 'bg-blue-600', 'text-white')
              btn.classList.add('bg-gray-100', 'text-gray-700')
            })
            
            // 대시보드 업데이트
            updateDashboard(startDate, endDate)
          })
        }
        
        // 기간 날짜 계산
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
        
        // JSON 백업 다운로드
        async function downloadJsonBackup() {
          console.log('📥 JSON 백업 다운로드 시작')
          try {
            const response = await fetch('/api/export/json')
            const result = await response.json()
            
            if (result.success) {
              const dataStr = JSON.stringify(result.data, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              
              const link = document.createElement('a')
              link.href = URL.createObjectURL(dataBlob)
              link.download = `saesoon_backup_${new Date().toISOString().split('T')[0]}.json`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              
              console.log('✅ JSON 백업 다운로드 완료')
            } else {
              alert('백업 생성 실패: ' + result.message)
            }
          } catch (error) {
            console.error('백업 다운로드 오류:', error)
            alert('백업 다운로드 중 오류가 발생했습니다.')
          }
        }
        
        // CSV 데이터 다운로드
        async function downloadCsvData(dataType) {
          console.log('📥 CSV 다운로드 시작:', dataType)
          try {
            const response = await fetch(`/api/export/${dataType}/csv`)
            const result = await response.json()
            
            if (result.success) {
              const csvBlob = new Blob([result.data], { type: 'text/csv;charset=utf-8' })
              
              const link = document.createElement('a')
              link.href = URL.createObjectURL(csvBlob)
              link.download = `${dataType}_${new Date().toISOString().split('T')[0]}.csv`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              
              console.log('✅ CSV 다운로드 완료:', dataType)
            } else {
              alert('CSV 생성 실패: ' + result.message)
            }
          } catch (error) {
            console.error('CSV 다운로드 오류:', error)
            alert('CSV 다운로드 중 오류가 발생했습니다.')
          }
        }
        
        // 오프라인 백업 생성
        async function createOfflineBackup() {
          console.log('💾 오프라인 백업 생성 시작')
          try {
            const response = await fetch('/api/export/json')
            const result = await response.json()
            
            if (result.success) {
              // 로컬스토리지에 백업 저장
              const backupKey = `saesoon_offline_backup_${Date.now()}`
              localStorage.setItem(backupKey, JSON.stringify(result.data))
              
              alert(`오프라인 백업이 생성되었습니다.\n백업키: ${backupKey}\n\n브라우저 개발자도구 > Application > Local Storage에서 확인할 수 있습니다.`)
              console.log('✅ 오프라인 백업 완료:', backupKey)
            } else {
              alert('오프라인 백업 실패: ' + result.message)
            }
          } catch (error) {
            console.error('오프라인 백업 오류:', error)
            alert('오프라인 백업 중 오류가 발생했습니다.')
          }
        }
        
        // 파일 업로드 처리
        async function handleFileUpload(event) {
          const file = event.target.files[0]
          if (!file) return
          
          console.log('📤 파일 업로드 시작:', file.name)
          
          // 업로드 상태 표시
          const statusDiv = document.getElementById('upload-status')
          const resultDiv = document.getElementById('file-result')
          
          if (statusDiv) {
            statusDiv.classList.remove('hidden')
          }
          if (resultDiv) {
            resultDiv.classList.add('hidden')
          }
          
          const reader = new FileReader()
          reader.onload = async function(e) {
            const content = e.target.result
            const fileType = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv'
            
            let dataType = 'transactions' // 기본값
            if (fileType === 'csv') {
              const csvTypeSelect = document.getElementById('csv-data-type')
              if (csvTypeSelect) {
                dataType = csvTypeSelect.value
              }
            }
            
            try {
              const response = await fetch(`/api/upload/file/${fileType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileContent: content,
                  dataType: dataType
                })
              })
              
              const result = await response.json()
              
              // 업로드 상태 숨기기
              if (statusDiv) {
                statusDiv.classList.add('hidden')
              }
              
              if (result.success) {
                // 결과 표시
                if (resultDiv) {
                  const contentDiv = document.getElementById('file-result-content')
                  if (contentDiv) {
                    contentDiv.innerHTML = 
                      '<div class="text-green-600">' +
                        '<i class="fas fa-check-circle mr-2"></i>' +
                        '<strong>업로드 성공!</strong>' +
                      '</div>' +
                      '<div class="mt-2">' + result.message + '</div>'
                  }
                  resultDiv.classList.remove('hidden')
                }
                
                // 모든 탭 새로고침 (데이터가 변경되었으므로)
                const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab
                console.log('🔄 파일 업로드 후 탭 새로고침, 현재 탭:', activeTab)
                
                if (activeTab === 'transactions') {
                  console.log('💰 회계관리 탭 새로고침')
                  loadTransactionsList()
                } else if (activeTab === 'dashboard') {
                  console.log('📊 대시보드 탭 새로고침')
                  updateDashboard()
                } else if (activeTab === 'reports') {
                  console.log('📈 보고서 탭 새로고침')
                  loadReports()
                }
                
                // 대시보드는 항상 업데이트 (다른 탭에서도 데이터 변경 사항 반영)
                console.log('📊 대시보드 강제 업데이트')
                updateDashboard()
                
                // 회계관리 탭에 있을 때는 거래 목록도 강제 새로고침
                if (activeTab === 'transactions') {
                  console.log('💰 거래 목록 강제 새로고침')
                  setTimeout(() => {
                    loadTransactionsList()
                  }, 500) // 0.5초 후 다시 로드
                }
                
                // 파일 입력 리셋
                event.target.value = ''
                const uploadBtn = event.target.id === 'json-file-input' ? 
                  document.getElementById('upload-json-btn') : 
                  document.getElementById('upload-csv-btn')
                if (uploadBtn) {
                  uploadBtn.disabled = true
                }
                
                console.log('✅ 파일 업로드 완료')
              } else {
                // 오류 결과 표시
                if (resultDiv) {
                  const contentDiv = document.getElementById('file-result-content')
                  if (contentDiv) {
                    contentDiv.innerHTML = 
                      '<div class="text-red-600">' +
                        '<i class="fas fa-times-circle mr-2"></i>' +
                        '<strong>업로드 실패</strong>' +
                      '</div>' +
                      '<div class="mt-2">' + result.message + '</div>'
                  }
                  resultDiv.classList.remove('hidden')
                }
              }
            } catch (error) {
              console.error('파일 업로드 오류:', error)
              
              // 업로드 상태 숨기기
              if (statusDiv) {
                statusDiv.classList.add('hidden')
              }
              
              // 오류 결과 표시
              if (resultDiv) {
                const contentDiv = document.getElementById('file-result-content')
                if (contentDiv) {
                  contentDiv.innerHTML = 
                    '<div class="text-red-600">' +
                      '<i class="fas fa-exclamation-triangle mr-2"></i>' +
                      '<strong>처리 중 오류 발생</strong>' +
                    '</div>' +
                    '<div class="mt-2">파일 업로드 중 오류가 발생했습니다.</div>'
                }
                resultDiv.classList.remove('hidden')
              }
            }
          }
          
          reader.readAsText(file)
        }
        
        // 부서 선택 후 메인 앱 시작
        function selectDepartment(department) {
          console.log('🏢 부서 선택 함수 호출됨:', department)
          
          try {
            currentDepartment = department
            selectedDepartment = department
            console.log('✅ 전역 변수 설정 완료')
            
            // 부서 선택 페이지 숨기기
            const deptSelectionEl = document.getElementById('department-selection')
            if (deptSelectionEl) {
              deptSelectionEl.style.display = 'none'
              console.log('✅ 부서 선택 페이지 숨김')
            } else {
              console.error('❌ department-selection 요소를 찾을 수 없음')
            }
            
            // 메인 컨텐츠 표시
            const mainContentEl = document.getElementById('main-content')
            if (mainContentEl) {
              mainContentEl.classList.remove('hidden')
              console.log('✅ 메인 컨텐츠 표시')
            } else {
              console.error('❌ main-content 요소를 찾을 수 없음')
            }
            
            // 헤더에 선택된 부서 표시
            const currentDeptEl = document.getElementById('current-department')
            if (currentDeptEl) {
              currentDeptEl.textContent = department
              console.log('✅ 헤더에 부서명 표시:', department)
            } else {
              console.error('❌ current-department 요소를 찾을 수 없음')
            }
            
            // 데이터 로드 및 초기화
            console.log('🚀 앱 초기화 시작')
            initializeApp()
            
          } catch (error) {
            console.error('❌ selectDepartment 오류:', error)
            alert('부서 선택 중 오류가 발생했습니다: ' + error.message)
          }
        }
        
        // 부서 변경 후 선택 화면으로 돌아가기
        function changeDepartment() {
          console.log('🔄 부서 변경')
          
          // 메인 컨텐츠 숨기기
          document.getElementById('main-content').classList.add('hidden')
          
          // 부서 선택 페이지 표시
          document.getElementById('department-selection').style.display = 'block'
          
          // 변수 초기화
          currentDepartment = null
          selectedDepartment = null
        }
        
        // 앱 초기화
        function initializeApp() {
          console.log('🚀 앱 초기화 시작, 선택된 부서:', currentDepartment)
          
          // 탭 버튼에 이벤트 리스너 추가
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
              console.log('🖱️ 탭 클릭:', this.dataset.tab)
              showTab(this.dataset.tab)
            })
          })
          
          // 부서 변경 버튼 이벤트
          document.getElementById('change-department')?.addEventListener('click', changeDepartment)
          
          // 파일관리 버튼 이벤트 리스너들
          setupFileManagementEvents()
          
          // 회계관리 폼 이벤트 리스너
          setupTransactionFormEvents()
          
          // 거래 폼 기본값 설정
          setupTransactionFormDefaults()
          
          // 기간 버튼 설정
          setupPeriodButtons()
          
          // 날짜 범위 이벤트 설정
          setupDateRangeEvents()
          
          // 기본 탭 표시
          showTab('dashboard')
        }
        
        // DOM 로드 후 초기화
        document.addEventListener('DOMContentLoaded', function() {
          console.log('🚀 DOM 로드 완룼')
          
          // 부서 선택 버튼 이벤트 리스너 추가
          console.log('🖱️ 부서 버튼 이벤트 리스너 설정 시작')
          const departmentButtons = document.querySelectorAll('.department-btn')
          console.log('🖱️ 찾은 부서 버튼 수:', departmentButtons.length)
          
          departmentButtons.forEach((btn, index) => {
            console.log('🖱️ 버튼', index + 1, ':', btn.dataset.department)
            btn.addEventListener('click', function(event) {
              console.log('📝 버튼 클릭 이벤트 발생:', this.dataset.department)
              const department = this.dataset.department
              
              try {
                selectDepartment(department)
              } catch (error) {
                console.error('❌ selectDepartment 오류:', error)
                alert('부서 선택 중 오류가 발생했습니다: ' + error.message)
              }
            })
          })
          
          console.log('✅ 부서 버튼 이벤트 리스너 설정 완료')
        })
        
        // 부서 옵션 로드 함수
        function loadDepartments() {
          console.log('🏢 부서 목록 로드')
          const departments = ['유아부', '유치부', '유년부', '초등부', '중등부', '고등부', '영어예배부']
          const select = document.getElementById('department-select')
          
          if (select) {
            // 기존 옵션들 유지하고 부서 옵션들 추가
            departments.forEach(dept => {
              const option = document.createElement('option')
              option.value = dept
              option.textContent = dept
              select.appendChild(option)
            })
            console.log('✅ 부서 옵션 추가됨:', departments.length + '개')
          }
        }
        
        // 파일관리 이벤트 설정
        function setupFileManagementEvents() {
          console.log('📁 파일관리 이벤트 설정')
          
          // JSON 다운로드
          document.getElementById('download-json-btn')?.addEventListener('click', downloadJsonBackup)
          
          // CSV 다운로드 버튼들
          document.getElementById('download-csv-transactions')?.addEventListener('click', () => downloadCsvData('transactions'))
          document.getElementById('download-csv-ministries')?.addEventListener('click', () => downloadCsvData('ministries'))
          document.getElementById('download-csv-prayers')?.addEventListener('click', () => downloadCsvData('prayers'))
          
          // 오프라인 백업
          document.getElementById('create-offline-backup-btn')?.addEventListener('click', createOfflineBackup)
          
          // 파일 업로드 (파일 선택은 input 태그 자체에서 처리)
          
          // 파일 입력 변경 이벤트 - 버튼 활성화
          document.getElementById('json-file-input')?.addEventListener('change', function(e) {
            const uploadBtn = document.getElementById('upload-json-btn')
            if (uploadBtn) {
              uploadBtn.disabled = !e.target.files[0]
            }
          })
          
          document.getElementById('csv-file-input')?.addEventListener('change', function(e) {
            const uploadBtn = document.getElementById('upload-csv-btn')
            if (uploadBtn) {
              uploadBtn.disabled = !e.target.files[0]
            }
          })
          
          // 실제 업로드 버튼 클릭 이벤트
          document.getElementById('upload-json-btn')?.addEventListener('click', function() {
            const fileInput = document.getElementById('json-file-input')
            if (fileInput && fileInput.files[0]) {
              handleFileUpload({ target: fileInput })
            }
          })
          
          document.getElementById('upload-csv-btn')?.addEventListener('click', function() {
            const fileInput = document.getElementById('csv-file-input')
            if (fileInput && fileInput.files[0]) {
              handleFileUpload({ target: fileInput })
            }
          })
        }
        
        // 거래 폼 기본값 설정
        function setupTransactionFormDefaults() {
          console.log('⚙️ 거래 폼 기본값 설정')
          
          // 현재 날짜를 기본값으로 설정
          const dateInput = document.getElementById('transaction-date')
          if (dateInput) {
            const today = new Date()
            const dateString = today.getFullYear() + '-' + 
              String(today.getMonth() + 1).padStart(2, '0') + '-' + 
              String(today.getDate()).padStart(2, '0')
            dateInput.value = dateString
            console.log('📅 기본 날짜 설정:', dateString)
          }
        }
        
        // 회계관리 폼 이벤트 설정
        function setupTransactionFormEvents() {
          console.log('💰 회계관리 폼 이벤트 설정')
          
          // 거래 폼 제출
          document.getElementById('transaction-form')?.addEventListener('submit', async function(e) {
            e.preventDefault()
            
            const formData = {
              date: document.getElementById('transaction-date').value,
              type: document.getElementById('transaction-type').value,
              department: currentDepartment, // 선택된 부서 사용
              item: document.getElementById('transaction-item').value,
              amount: parseFloat(document.getElementById('transaction-amount').value),
              manager: document.getElementById('transaction-manager').value,
              description: document.getElementById('transaction-description').value
            }
            
            try {
              const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              })
              
              const result = await response.json()
              if (result.success) {
                alert('거래가 성공적으로 추가되었습니다.')
                document.getElementById('transaction-form').reset()
                loadTransactionsList()
                updateDashboard() // 대시보드도 업데이트
              } else {
                alert('오류: ' + result.message)
              }
            } catch (error) {
              console.error('거래 추가 오류:', error)
              alert('거래 추가 중 오류가 발생했습니다.')
            }
          })
          
          // 폼 초기화
          document.getElementById('clear-transaction-form')?.addEventListener('click', function() {
            document.getElementById('transaction-form').reset()
          })
          
          // 거래 새로고침
          document.getElementById('refresh-transactions')?.addEventListener('click', loadTransactionsList)
          
          // 전체 삭제
          document.getElementById('delete-all-transactions')?.addEventListener('click', deleteAllTransactions)
        }
