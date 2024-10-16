![Logo](/public/images/README_thumbnail.png)

# RapidStock

https://project-rapid-stock.vercel.app/

RapidStock는 실시간으로 주식 시장의 최신 뉴스를 크롤링하고, 뉴스에서 언급된 관련 주식을 자동으로 추출하며, 이를 바탕으로 주식 데이터를 시각화해 빠르게 시장 상황을 파악할 수 있도록 돕는 주식 시장 분석 서비스입니다.
<br><br>

## 프로젝트 개요

- **목적**: RapidStock는 사용자가 실시간으로 주식 시장의 흐름을 파악하고 분석할 수 있도록 돕습니다. 이를 통해 투자 결정을 신속하고 효율적으로 내릴 수 있습니다.
- **핵심 기능**
  - **실시간 뉴스 크롤링**: 최신 주식 관련 뉴스를 자동으로 수집하고 분석하여 뉴스에서 언급된 주식을 추출, 제공.
  - **증권 데이터 시각화**: 주식 데이터를 기반으로 차트를 생성해 사용자에게 직관적인 시각적 정보를 제공합니다.
  - **커뮤니티 채팅 기능**: 주식 시장에 대한 의견 교환과 토론을 위한 실시간 채팅 기능을 제공합니다.
    <br><br>

## 핵심 기능

1. **실시간 뉴스 크롤링**
   - 네이버 금융 뉴스페이지에서 최신 뉴스 데이터를 자동으로 수집하고, 텍스트 분석을 통해 데이터에서 제목, 요약, 링크 등의 정보를 추출하는 기능을 수행합니다.
   - 뉴스 요약 데이터를 바탕으로 LLM 프롬프트 엔지니어링을 사용하여 자연어 분석을 통해 기사와 관련된 회사 이름과 종목 코드를 추출해 국내 주식회사들의 명칭 및 코드와 매칭하여 관련 회사를 찾고, 기사와 함께 Supabase 데이터베이스에 저장합니다.
2. **증권 데이터 시각화**
   - DevExtreme 라이브러리를 활용한 고성능 데이터 그리드와 차트를 사용하여 사용자 경험을 극대화합니다.
   - 다양한 차트 및 그래프를 통해 주식의 가격 변동, 거래량, 이동평균선(MA), 볼린저 밴드 등을 시각화해서 보여주며, 사용자는 원하는 주식 종목의 데이터 변화를 비교분석할 수 있습니다.
3. **커뮤니티 채팅 기능**
   - 사용자 간 실시간 채팅을 통해 투자 아이디어를 공유하고 의견을 나눌 수 있는 기능을 제공하여 주식에 대한 논의를 활성화하고 시장 상황에 대한 다각적인 관점 만들 수 있도록 합니다.
     <br><br>

## 기술 스택

- **프론트엔드**
  - **React**
    - 컴포넌트 기반 아키텍쳐와 Hooks를 사용해 재사용 가능한 컴포넌트를 만들고, 유지보수에 용이
    - 다양한 라이브러리와의 유연한 연계를 통해 다양한 기능을 구현하는 데 적합
  - **TypeScript**
    - 정적 타입을 사용하기 때문에 오류를 줄이고 코드 안정성과 가독성 향상
    - 리팩토링을 지원하며 해당하는 모든 참조를 자동으로 업데이트해 구조 변경에 용이
  - **Next.js**
    - 서버 사이드 렌더링(SSR)을 지원하기 때문에 주식 프로젝트에 필수적인 서버를 통한 API와의 연결을 위해 활용
    - 폴더 구조에 기반한 라우팅 기능을 제공해 라우팅 설정과 코드 관리가 용이
    - Typescript와의 호환성이 좋고, Vercel과 같은 플랫폼과도 함께 사용하기 용이
  - **Tailwind CSS**
    - 유틸리티 기반의 CSS 프레임워크로, 협업 시 스타일링의 용이함과 일관된 디자인 적용이 수월
    - 최적화된 CSS로 사용하는 클래스들만 생성해 성능과 로딩 속도를 향상
- **백엔드 및 데이터베이스**
  - **Supabase**
    - 사용자 인증을 지원하는 오픈소스로 인증 및 권한 관리에 활용
    - Supabase Realtime 기능을 활용해 주식 데이터 및 사용자 활동의 실시간 동기화를 지원하여 최신 데이터를 빠르게 제공
- **데이터 시각화**
  - **DevExtreme** - 대용량 데이터를 처리해 그리드 및 차트를 제공하는 라이브러리 - 다양한 차트 컴포넌트를 통해 효과적으로 시각화할 수 있음
    <br><br>

## 파일구조

```

/open-market
│
├── /auth                   # 사용자 인증 및 권한
│
├── /api                    # api route
│   ├── /Stock              # 주식 데이터 연동
│   └── /websocket          # 실시간 웹소켓 연동
│
├── /components             # 컴포넌트 단위 기능
│
├── /news                   # 뉴스 페이지
│   └── /[id]               # 개별 이동을 위한 동적 route
│
└── /utils                  # api 요청
│    └── supabase.ts        # supabase 데이터 연동
│
└── README.md               # 프로젝트 설명서

```

<br><br>

## 프로젝트 상태

RapidStock는 현재 활성 개발 중이며, 사용자의 피드백과 함께 기능 개선 및 새로운 기능 추가가 지속적으로 이루어지고 있습니다. 주식 시장의 변화를 신속하게 반영하여 더욱 정교한 서비스를 제공할 계획입니다.

**작업 기간**: 2024년 9월 19일 ~ 2024년 10월 21일
<br><br>

## 팀원

- **오용민** - 프로젝트 매니저 및 코드 리팩토링 작업
- **장유주** - DevExtreme을 통한 데이터 시각화 및 어플리케이션리팩토링 작업
- **진승현** - UI/UX 디자인 및 주식 API 연동과 테이블 구현
- **장나리** - Supabase 및 회원가입, 로그인 기능 개발
- **지명진** - 뉴스 크롤링 및 텍스트 분석 모듈 개발
  <br><br>
