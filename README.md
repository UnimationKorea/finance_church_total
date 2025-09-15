# 새순 교육부 통합 관리 시스템 ⛪

교회 교육부서의 회계, 사역, 기도제목을 효율적으로 관리할 수 있는 웹 애플리케이션입니다.

![시스템 스크린샷](docs/screenshot.png)

## 🌟 주요 기능

### 📊 대시보드
- 실시간 재정 현황 (수입/지출/잔액/거래건수)
- 기간별 조회 (이번 달, 분기별, 반년, 1년)
- 월별 수입/지출 차트
- 빠른 날짜 선택 버튼

### 💰 회계관리
- 거래 내역 추가/수정/삭제
- 수입/지출/예산 구분 관리
- 부서별 거래 필터링
- 거래 내역 검색 및 정렬
- 실시간 통계 업데이트

### 🏢 부서별 관리
- **유아부** (0-3세 유아 교육)
- **유치부** (4-6세 유치 교육) 
- **유년부** (초등학교 저학년)
- **초등부** (초등학교 고학년)
- **중등부** (중학생 교육)
- **고등부** (고등학생 교육)
- **영어예배부** (영어 예배 및 교육)

### 📁 파일 관리
- **데이터 백업**: JSON 전체 백업
- **CSV 내보내기**: Excel로 편집 가능한 형식
- **오프라인 백업**: 로컬 저장소 백업
- **데이터 복원**: JSON/CSV 파일 가져오기

### 📈 보고서
- 부서별 재정 현황 요약
- 최근 거래 내역 (최근 10건)
- 월별 수입/지출 분석
- 인쇄 가능한 보고서 형식

## 🚀 시작하기

### 필수 요구사항
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 인터넷 연결 (CDN 리소스 로드용)

### 설치 방법

1. **저장소 클론**
   ```bash
   git clone https://github.com/username/saesoon-education-management-system.git
   cd saesoon-education-management-system
   ```

2. **의존성 설치** (선택사항)
   ```bash
   npm install
   ```

3. **로컬 서버 실행**
   ```bash
   # npm을 사용하는 경우
   npm start
   
   # 또는 직접 http-server 사용
   npx http-server -p 3000 -c-1
   
   # 또는 Python 내장 서버
   python -m http.server 3000
   ```

4. **브라우저에서 접속**
   ```
   http://localhost:3000
   ```

### 빠른 시작
1. 웹사이트에 접속하면 부서 선택 화면이 나타납니다
2. 관리하고자 하는 부서를 선택합니다
3. 대시보드에서 현재 상태를 확인합니다
4. 회계관리 탭에서 거래를 추가/관리합니다
5. 보고서 탭에서 상세 분석을 확인합니다

## 📂 프로젝트 구조

```
saesoon-education-management-system/
├── index.html              # 메인 HTML 파일
├── package.json            # Node.js 패키지 설정
├── README.md              # 프로젝트 문서
├── static/                # 정적 자원
│   ├── css/
│   │   └── style.css      # 커스텀 CSS 스타일
│   ├── js/
│   │   └── app.js         # 메인 JavaScript 애플리케이션
│   └── images/            # 이미지 파일
├── api/                   # API 관련 파일 (추후 백엔드)
└── docs/                  # 문서 및 스크린샷
```

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 스타일링 + CSS Variables
- **JavaScript (ES6+)**: 순수 바닐라 자바스크립트
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크

### 라이브러리 & 도구
- **Chart.js**: 데이터 시각화 차트
- **Font Awesome**: 아이콘
- **PapaParse**: CSV 파일 처리
- **XLSX**: Excel 파일 처리
- **Inter & Noto Sans KR**: 웹 폰트

### 저장소
- **LocalStorage**: 클라이언트 사이드 데이터 저장
- **JSON/CSV**: 데이터 백업 및 복원

## 📖 사용법

### 1. 부서 선택
- 시스템 시작 시 부서 선택 화면이 표시됩니다
- 관리하고자 하는 교육부서를 클릭하여 선택합니다
- 선택한 부서의 데이터만 관리됩니다

### 2. 거래 추가
- 회계관리 탭으로 이동합니다
- "새 거래 추가" 폼을 작성합니다:
  - 날짜: 거래 발생일
  - 구분: 수입/지출/예산
  - 항목: 헌금, 후원금, 교재비 등
  - 금액: 거래 금액
  - 담당자: 거래 담당자명
  - 설명: 상세 설명 (선택사항)

### 3. 데이터 관리
- **백업**: 파일관리 → JSON 전체 백업
- **내보내기**: CSV 데이터 다운로드
- **복원**: JSON/CSV 파일 업로드

### 4. 보고서 확인
- 보고서 탭에서 상세 분석을 확인합니다
- 부서별 현황, 최근 거래, 월별 통계를 제공합니다

## 🔧 설정 및 커스터마이징

### CSS 변수 수정
`static/css/style.css`에서 색상 테마를 변경할 수 있습니다:

```css
:root {
  --bg: #f7fdfe;           /* 배경색 */
  --text: #39404d;         /* 기본 텍스트 색상 */
  --primary: #1dacd3;      /* 기본 색상 */
  --success: #16a34a;      /* 성공 색상 */
  --warning: #f59e0b;      /* 경고 색상 */
  --error: #dc2626;        /* 오류 색상 */
}
```

### 부서 목록 수정
`static/js/app.js`에서 부서 목록을 수정할 수 있습니다:

```javascript
const departments = ['유아부', '유치부', '유년부', '초등부', '중등부', '고등부', '영어예배부']
```

## 📱 반응형 디자인

이 시스템은 다양한 디바이스에서 최적화되어 동작합니다:
- **데스크톱**: 전체 기능 사용 가능
- **태블릿**: 터치 친화적 인터페이스
- **모바일**: 모바일 최적화 레이아웃

## 🔒 데이터 보안

- 모든 데이터는 브라우저의 LocalStorage에 저장됩니다
- 데이터는 사용자의 로컬 디바이스에만 저장되며 외부로 전송되지 않습니다
- 정기적인 백업을 통해 데이터 손실을 방지할 수 있습니다

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

문의사항이나 제안사항이 있으시면 다음으로 연락해 주세요:

- 프로젝트 링크: [https://github.com/username/saesoon-education-management-system](https://github.com/username/saesoon-education-management-system)
- 이슈 트래커: [https://github.com/username/saesoon-education-management-system/issues](https://github.com/username/saesoon-education-management-system/issues)

## 🔮 향후 개발 계획

- [ ] 백엔드 API 서버 구축
- [ ] 사용자 인증 및 권한 관리
- [ ] 사역관리 기능 구현
- [ ] 기도제목 관리 기능 구현
- [ ] 모바일 앱 개발
- [ ] 실시간 데이터 동기화
- [ ] 고급 보고서 기능
- [ ] 이메일 알림 기능

---

⛪ **새순 교육부 통합 관리 시스템**으로 더 효율적인 교회 교육부 관리를 경험해보세요!