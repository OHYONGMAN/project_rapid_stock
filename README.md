This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# project_rapid_stock

PROJECT_RAPID_STOCK
├── .next
├── .vscode
├── app
│ ├── (auth)
│ ├── components
│ │ ├── mypage
│ │ ├── news
│ │ │ ├── components
│ │ │ │ ├── NewsPageClient.tsx
│ │ │ │ ├── StockChart.tsx
│ │ │ │ ├── TooltipTemplate.tsx
│ │ │ ├── page.tsx
│ ├── utils
│ │ ├── supabase.ts
│ │ ├── supabase-server.ts
│ ├── globals.css
│ ├── layout.tsx
│ ├── page.tsx
├── node_modules
├── public
├── supabase
│ ├── .temp
│ ├── functions
│ │ ├── fetchStockData
│ │ │ ├── index.ts
│ │ │ ├── stockData.ts
│ │ │ ├── tokenManager.ts
├── .gitignore
├── config.toml
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── deno.json
├── deno.lock
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
├── README.md

OAuth인증
WEBSOCKET
실시간 (웹소켓) 접속키 발급[실시간-000]
기본정보
MethodPOST
실전 Domainhttps://openapi.koreainvestment.com:9443
모의 Domainhttps://openapivts.koreainvestment.com:29443
URL/oauth2/Approval
FormatJSON
Content-Type
개요
실시간 (웹소켓) 접속키 발급받으실 수 있는 API 입니다.
웹소켓 이용 시 해당 키를 appkey와 appsecret 대신 헤더에 넣어 API를 호출합니다.

접속키의 유효기간은 24시간이지만, 접속키는 세션 연결 시 초기 1회만 사용하기 때문에 접속키 인증 후에는 세션종료되지 않는 이상 접속키 신규 발급받지 않으셔도 365일 내내 웹소켓 데이터 수신하실 수 있습니다.
LAYOUT
Request
Header
Element 한글명 Type Required Length Description
content-type 컨텐츠타입 String N 20 application/json; utf-8
Body
Element 한글명 Type Required Length Description
grant_type 권한부여타입 String Y 18 "client_credentials"
appkey 앱키 String Y 36 한국투자증권 홈페이지에서 발급받은 appkey (절대 노출되지 않도록 주의해주세요.)
secretkey 시크릿키 String Y 180 한국투자증권 홈페이지에서 발급받은 appkey (절대 노출되지 않도록 주의해주세요.)
Response
Body
Element 한글명 Type Required Length Description
approval_key 웹소켓 접속키 String Y 286 웹소켓 이용 시 발급받은 웹소켓 접속키를 appkey와 appsecret 대신 헤더에 넣어 API 호출합니다.
Example
Request
{
"grant_type": "client_credentials",
"appkey": "PSg5dctL9dKPo727J13Ur405OSXXXXXXXXXX",
"secretkey": "yo2t8zS68zpdjGuWvFyM9VikjXE0i0CbgPEamnqPA00G0bIfrdfQb2RUD1xP7SqatQXr1cD1fGUNsb78MMXoq6o4lAYt9YTtHAjbMoFy+c72kbq5owQY1Pvp39/x6ejpJlXCj7gE3yVOB/h25Hvl+URmYeBTfrQeOqIAOYc/OIXXXXXXXXXX"
}
Response
{
"approval_key": "a2585daf-8c09-4587-9fce-8ab893XXXXX"
}
REST
Hashkey
기본정보
MethodPOST
실전 Domainhttps://openapi.koreainvestment.com:9443
모의 Domainhttps://openapivts.koreainvestment.com:29443
URL/uapi/hashkey
FormatJSON
Content-Typeapplication/json
개요
해쉬키(Hashkey)는 보안을 위한 요소로 사용자가 보낸 요청 값을 중간에 탈취하여 변조하지 못하도록 하는데 사용됩니다.
해쉬키를 사용하면 POST로 보내는 요청(주로 주문/정정/취소 API 해당)의 body 값을 사전에 암호화시킬 수 있습니다.
해쉬키는 비필수값으로 사용하지 않아도 POST API 호출은 가능합니다.
LAYOUT
Request
Header
Element 한글명 Type Required Length Description
content-type 컨텐츠타입 String N 40 application/json; charset=utf-8
appkey 앱키 String Y 36 한국투자증권 홈페이지에서 발급받은 appkey (절대 노출되지 않도록 주의해주세요.)
appsecret 앱시크릿키 String Y 180 한국투자증권 홈페이지에서 발급받은 appsecret (절대 노출되지 않도록 주의해주세요.)
Body
Element 한글명 Type Required Length Description
JsonBody 요청값 Object Y POST로 보낼 body값

ex)
datas = {
"CANO": '00000000',
"ACNT_PRDT_CD": "01",
"OVRS_EXCG_CD": "SHAA"
}
Response
Body
Element 한글명 Type Required Length Description
JsonBody 요청값 Object Y 요청한 JsonBody
HASH 해쉬키 String Y 256 [POST API 대상] Client가 요청하는 Request Body를 hashkey api로 생성한 Hash값

- API문서 > hashkey 참조
  Example
  Request
  {
  "ORD_PRCS_DVSN_CD": "02",
  "CANO": "계좌번호",
  "ACNT_PRDT_CD": "03",
  "SLL_BUY_DVSN_CD": "02",
  "SHTN_PDNO": "101S06",
  "ORD_QTY": "1",
  "UNIT_PRICE": "370",
  "NMPR_TYPE_CD": "",
  "KRX_NMPR_CNDT_CD": "",
  "CTAC_TLNO": "",
  "FUOP_ITEM_DVSN_CD": "",
  "ORD_DVSN_CD": "02"
  }
  Response
  {
  "BODY": {
  "ORD_PRCS_DVSN_CD": "02",
  "CANO": "계좌번호",
  "ACNT_PRDT_CD": "03",
  "SLL_BUY_DVSN_CD": "02",
  "SHTN_PDNO": "101S06",
  "ORD_QTY": "1",
  "UNIT_PRICE": "370",
  "NMPR_TYPE_CD": "",
  "KRX_NMPR_CNDT_CD": "",
  "CTAC_TLNO": "",
  "FUOP_ITEM_DVSN_CD": "",
  "ORD_DVSN_CD": "02"
  },
  "HASH": "8b84068222a49302f7ef58226d90403f62e216828f8103465f900de0e7be2f0f"
  }
  REST
  접근토큰발급(P)[인증-001]
  기본정보
  MethodPOST
  실전 Domainhttps://openapi.koreainvestment.com:9443
  모의 Domainhttps://openapivts.koreainvestment.com:29443
  URL/oauth2/tokenP
  FormatJSON
  Content-Typeapplication/json; charset=UTF-8
  개요
  본인 계좌에 필요한 인증 절차로, 인증을 통해 접근 토큰을 부여받아 오픈API 활용이 가능합니다.

1. 접근토큰(access_token)의 유효기간은 24시간 이며(1일 1회발급 원칙)
   갱신발급주기는 6시간 입니다.(6시간 이내는 기존 발급키로 응답)

2. 접근토큰발급(/oauth2/tokenP) 시 접근토큰값(access_token)과 함께 수신되는
   접근토큰 유효기간(acess_token_token_expired)을 이용해 접근토큰을 관리하실 수 있습니다.

[참고]

'23.4.28 이후 지나치게 잦은 토큰 발급 요청건을 제어 하기 위해 신규 접근토큰발급 이후 일정시간 이내에 재호출 시에는 직전 토큰값을 리턴하게 되었습니다. 일정시간 이후 접근토큰발급 API 호출 시에는 신규 토큰값을 리턴합니다.
접근토큰발급 API 호출 및 코드 작성하실 때 해당 사항을 참고하시길 바랍니다.

※ 참고 : 포럼 > 공지사항 > [수정] [중요] 접근 토큰 발급 변경 안내
LAYOUT
Request
Body
Element 한글명 Type Required Length Description
grant_type 권한부여 Type String Y 18 client_credentials
appkey 앱키 String Y 36 한국투자증권 홈페이지에서 발급받은 appkey (절대 노출되지 않도록 주의해주세요.)
appsecret 앱시크릿키 String Y 180 한국투자증권 홈페이지에서 발급받은 appsecret (절대 노출되지 않도록 주의해주세요.)
Response
Body
Element 한글명 Type Required Length Description
access_token 접근토큰 String Y 350 OAuth 토큰이 필요한 API 경우 발급한 Access token
ex) "eyJ0eXUxMiJ9.eyJz…..................................."

- 일반개인고객/일반법인고객
  . Access token 유효기간 1일
  .. 일정시간(6시간) 이내에 재호출 시에는 직전 토큰값을 리턴
  . OAuth 2.0의 Client Credentials Grant 절차를 준용

- 제휴법인
  . Access token 유효기간 3개월
  . Refresh token 유효기간 1년
  . OAuth 2.0의 Authorization Code Grant 절차를 준용
  token_type 접근토큰유형 String Y 20 접근토큰유형 : "Bearer"
  ※ API 호출 시, 접근토큰유형 "Bearer" 입력. ex) "Bearer eyJ...."
  expires_in 접근토큰 유효기간 Number Y 10 유효기간(초)
  ex) 7776000
  acess_token_token_expired 접근토큰 유효기간(일시표시) String Y 50 유효기간(년:월:일 시:분:초)
  ex) "2022-08-30 08:10:10"
  Example
  Request
  {
  "grant_type": "client_credentials",
  "appkey": "PSg5dctL9dKPo727J13Ur405OSXXXXXXXXXX",
  "appsecret": "yo2t8zS68zpdjGuWvFyM9VikjXE0i0CbgPEamnqPA00G0bIfrdfQb2RUD1xP7SqatQXr1cD1fGUNsb78MMXoq6o4lAYt9YTtHAjbMoFy+c72kbq5owQY1Pvp39/x6ejpJlXCj7gE3yVOB/h25Hvl+URmYeBTfrQeOqIAOYc/OIXXXXXXXXXX"
  }
  Response
  {
  "access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6ImMwNzM1NTYzLTA1MjctNDNhZS05ODRiLTJiNWI1ZWZmOWYyMyIsImlzcyI6InVub2d3IiwiZXhwIjoxNjQ5NzUxMTAwLCJpYXQiOjE2NDE5NzUxMDAsImp0aSI6IkJTZlM0QUtSSnpRVGpmdHRtdXZlenVQUTlKajc3cHZGdjBZVyJ9.Oyt_C639yUjWmRhymlszgt6jDo8fvIKkkxH1mMngunV1T15SCC4I3Xe6MXxcY23DXunzBfR1uI0KXXXXXXXXXX",
  "access_token_token_expired":"2023-12-22 08:16:59",
  "token_type":"Bearer",
  "expires_in":86400
  }
  REST
  접근토큰폐기(P)[인증-002]
  기본정보
  MethodPOST
  실전 Domainhttps://openapi.koreainvestment.com:9443
  모의 Domainhttps://openapivts.koreainvestment.com:29443
  URL/oauth2/revokeP
  FormatJSON
  Content-Typeapplication/json; charset=UTF-8
  개요
  부여받은 접큰토큰을 더 이상 활용하지 않을 때 사용합니다.
  LAYOUT
  Request
  Body
  Element 한글명 Type Required Length Description
  appkey 고객 앱Key String Y 36 한국투자증권 홈페이지에서 발급받은 appkey (절대 노출되지 않도록 주의해주세요.)
  appsecret 고객 앱Secret String Y 180 한국투자증권 홈페이지에서 발급받은 appsecret (절대 노출되지 않도록 주의해주세요.)
  token 접근토큰 String Y 286 OAuth 토큰이 필요한 API 경우 발급한 Access token
  일반고객(Access token 유효기간 1일, OAuth 2.0의 Client Credentials Grant 절차를 준용)
  법인(Access token 유효기간 3개월, Refresh token 유효기간 1년, OAuth 2.0의 Authorization Code Grant 절차를 준용)
  Response
  Body
  Element 한글명 Type Required Length Description
  code 응답코드 String N 8 HTTP 응답코드
  message 응답메세지 String N 450 응답메세지
  Example
  Request
  {
  "appkey" : "PSw2UvBQCpoZFc7nZpIfIrOttmXXXXXXXXXX",
  "appsecret" : "/g84gaZp7W3DJEZhamiTH8ZdJkUJ8603rjo3HcOm5PvIc1YC3YmyJOQoW1H0kNjo4IbHwGUdi3+9oEbH4RKKl8GnEu3n/khxm0OrwHkQur+wbA74fcFXxaUnEbftu0X72Eaw9dEBMuK3rODeeOanrsJ1kZ9oKWykIG04F0nmgdXXXXXXXXXX",
  "token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6IjZmNDgxMjBiLTlmMDItNGI5ZS05MGExLTRiNDk2MGM5ZWY2MyIsImlzcyI6InVub2d3IiwiZXhwIjoxNjQzMjg2MDUzLCJpYXQiOjE2NDMxOTk2NTMsImp0aSI6IlBTdzJVdkJRQ3dvWkZhOG5acElmSXJPdHRtZUtLUGZCclNKcyJ9.6Z-UvArobBfXbnpSFbFhd9WPVEM3ZQa5NEpqfmQ6rrZBISCi-P9CEamfVReIduTVYbafF02Pl6EPXXXXXXXXXX"
  }
  Response
  {
  "code" : 200,
  "message" : "접근토큰 폐기에 성공하였습니다"
  }

[국내주식] 기본시세
REST
주식현재가 시세[v1_국내주식-008]
기본정보
MethodGET
실전 Domainhttps://openapi.koreainvestment.com:9443
모의 Domainhttps://openapivts.koreainvestment.com:29443
URL/uapi/domestic-stock/v1/quotations/inquire-price
Format
Content-Type
개요
주식 현재가 시세 API입니다. 실시간 시세를 원하신다면 웹소켓 API를 활용하세요.

※ 종목코드 마스터파일 파이썬 정제코드는 한국투자증권 Github 참고 부탁드립니다.
https://github.com/koreainvestment/open-trading-api/tree/main/stocks_info
LAYOUT
Request
Header
Element 한글명 Type Required Length Description
content-type 컨텐츠타입 String N 40 application/json; charset=utf-8
authorization 접근토큰 String Y 40 OAuth 토큰이 필요한 API 경우 발급한 Access token
일반고객(Access token 유효기간 1일, OAuth 2.0의 Client Credentials Grant 절차를 준용)
법인(Access token 유효기간 3개월, Refresh token 유효기간 1년, OAuth 2.0의 Authorization Code Grant 절차를 준용)

※ 토큰 지정시 토큰 타입("Bearer") 지정 필요. 즉, 발급받은 접근토큰 앞에 앞에 "Bearer" 붙여서 호출
EX) "Bearer eyJ..........8GA"
appkey 앱키 String Y 36 한국투자증권 홈페이지에서 발급받은 appkey (절대 노출되지 않도록 주의해주세요.)
appsecret 앱시크릿키 String Y 180 한국투자증권 홈페이지에서 발급받은 appsecret (절대 노출되지 않도록 주의해주세요.)
personalseckey 고객식별키 String N 180 [법인 필수] 제휴사 회원 관리를 위한 고객식별키
tr_id 거래ID String Y 13 [실전투자/모의투자]
FHKST01010100 : 주식현재가 시세
tr_cont 연속 거래 여부 String N 1 공백 : 초기 조회
N : 다음 데이터 조회 (output header의 tr_cont가 M일 경우)
custtype 고객타입 String N 1 B : 법인
P : 개인
seq_no 일련번호 String N 2 [법인 필수] 001
mac_address 맥주소 String N 12 법인고객 혹은 개인고객의 Mac address 값
phone_number 핸드폰번호 String N 12 [법인 필수] 제휴사APP을 사용하는 경우 사용자(회원) 핸드폰번호
ex) 01011112222 (하이픈 등 구분값 제거)
ip_addr 접속 단말 공인 IP String N 12 [법인 필수] 사용자(회원)의 IP Address
hashkey 해쉬키 String N 256 [POST API 대상] Client가 요청하는 Request Body를 hashkey api로 생성한 Hash값

- API문서 > hashkey 참조
  gt_uid Global UID String N 32 [법인 필수] 거래고유번호로 사용하므로 거래별로 UNIQUE해야 함
  Query Parameter
  Element 한글명 Type Required Length Description
  FID_COND_MRKT_DIV_CODE FID 조건 시장 분류 코드 String Y 2 J : 주식, ETF, ETN
  W: ELW
  FID_INPUT_ISCD FID 입력 종목코드 String Y 12 종목번호 (6자리)
  ETN의 경우, Q로 시작 (EX. Q500001)
  Response
  Header
  Element 한글명 Type Required Length Description
  content-type 컨텐츠타입 String Y 40 application/json; charset=utf-8
  tr_id 거래ID String Y 13 요청한 tr_id
  tr_cont 연속 거래 여부 String Y 1 F or M : 다음 데이터 있음
  D or E : 마지막 데이터
  gt_uid Global UID String Y 32 거래고유번호
  Body
  Element 한글명 Type Required Length Description
  rt_cd 성공 실패 여부 String Y 1 0 : 성공
  0 이외의 값 : 실패
  msg_cd 응답코드 String Y 8 응답코드
  msg1 응답메세지 String Y 80 응답메세지
  output 응답상세 Object Y null
  -iscd_stat_cls_code 종목 상태 구분 코드 String Y 3 00 : 그외
  51 : 관리종목
  52 : 투자위험
  53 : 투자경고
  54 : 투자주의
  55 : 신용가능
  57 : 증거금 100%
  58 : 거래정지
  59 : 단기과열
  -marg_rate 증거금 비율 String Y 12
  -rprs_mrkt_kor_name 대표 시장 한글 명 String Y 40
  -new_hgpr_lwpr_cls_code 신 고가 저가 구분 코드 String Y 10 조회하는 종목이 신고/신저에 도달했을 경우에만 조회됨
  -bstp_kor_isnm 업종 한글 종목명 String Y 40
  -temp_stop_yn 임시 정지 여부 String Y 1
  -oprc_rang_cont_yn 시가 범위 연장 여부 String Y 1
  -clpr_rang_cont_yn 종가 범위 연장 여부 String Y 1
  -crdt_able_yn 신용 가능 여부 String Y 1
  -grmn_rate_cls_code 보증금 비율 구분 코드 String Y 3 한국투자 증거금비율 (marg_rate 참고)
  40 : 20%, 30%, 40%
  50 : 50%
  60 : 60%
  -elw_pblc_yn ELW 발행 여부 String Y 1
  -stck_prpr 주식 현재가 String Y 10
  -prdy_vrss 전일 대비 String Y 10
  -prdy_vrss_sign 전일 대비 부호 String Y 1 1 : 상한
  2 : 상승
  3 : 보합
  4 : 하한
  5 : 하락
  -prdy_ctrt 전일 대비율 String Y 10
  -acml_tr_pbmn 누적 거래 대금 String Y 18
  -acml_vol 누적 거래량 String Y 18
  -prdy_vrss_vol_rate 전일 대비 거래량 비율 String Y 12 주식현재가 일자별 API 응답값 사용
  -stck_oprc 주식 시가 String Y 10
  -stck_hgpr 주식 최고가 String Y 10
  -stck_lwpr 주식 최저가 String Y 10
  -stck_mxpr 주식 상한가 String Y 10
  -stck_llam 주식 하한가 String Y 10
  -stck_sdpr 주식 기준가 String Y 10
  -wghn_avrg_stck_prc 가중 평균 주식 가격 String Y 21
  -hts_frgn_ehrt HTS 외국인 소진율 String Y 82
  -frgn_ntby_qty 외국인 순매수 수량 String Y 12
  -pgtr_ntby_qty 프로그램매매 순매수 수량 String Y 18
  -pvt_scnd_dmrs_prc 피벗 2차 디저항 가격 String Y 10 직원용 데이터
  -pvt_frst_dmrs_prc 피벗 1차 디저항 가격 String Y 10 직원용 데이터
  -pvt_pont_val 피벗 포인트 값 String Y 10 직원용 데이터
  -pvt_frst_dmsp_prc 피벗 1차 디지지 가격 String Y 10 직원용 데이터
  -pvt_scnd_dmsp_prc 피벗 2차 디지지 가격 String Y 10 직원용 데이터
  -dmrs_val 디저항 값 String Y 10 직원용 데이터
  -dmsp_val 디지지 값 String Y 10 직원용 데이터
  -cpfn 자본금 String Y 22
  -rstc_wdth_prc 제한 폭 가격 String Y 10
  -stck_fcam 주식 액면가 String Y 11
  -stck_sspr 주식 대용가 String Y 10
  -aspr_unit 호가단위 String Y 10
  -hts_deal_qty_unit_val HTS 매매 수량 단위 값 String Y 10
  -lstn_stcn 상장 주수 String Y 18
  -hts_avls HTS 시가총액 String Y 18
  -per PER String Y 10
  -pbr PBR String Y 10
  -stac_month 결산 월 String Y 2
  -vol_tnrt 거래량 회전율 String Y 10
  -eps EPS String Y 13
  -bps BPS String Y 13
  -d250_hgpr 250일 최고가 String Y 10
  -d250_hgpr_date 250일 최고가 일자 String Y 8
  -d250_hgpr_vrss_prpr_rate 250일 최고가 대비 현재가 비율 String Y 12
  -d250_lwpr 250일 최저가 String Y 10
  -d250_lwpr_date 250일 최저가 일자 String Y 8
  -d250_lwpr_vrss_prpr_rate 250일 최저가 대비 현재가 비율 String Y 12
  -stck_dryy_hgpr 주식 연중 최고가 String Y 10
  -dryy_hgpr_vrss_prpr_rate 연중 최고가 대비 현재가 비율 String Y 12
  -dryy_hgpr_date 연중 최고가 일자 String Y 8
  -stck_dryy_lwpr 주식 연중 최저가 String Y 10
  -dryy_lwpr_vrss_prpr_rate 연중 최저가 대비 현재가 비율 String Y 12
  -dryy_lwpr_date 연중 최저가 일자 String Y 8
  -w52_hgpr 52주일 최고가 String Y 10
  -w52_hgpr_vrss_prpr_ctrt 52주일 최고가 대비 현재가 대비 String Y 10
  -w52_hgpr_date 52주일 최고가 일자 String Y 8
  -w52_lwpr 52주일 최저가 String Y 10
  -w52_lwpr_vrss_prpr_ctrt 52주일 최저가 대비 현재가 대비 String Y 10
  -w52_lwpr_date 52주일 최저가 일자 String Y 8
  -whol_loan_rmnd_rate 전체 융자 잔고 비율 String Y 12
  -ssts_yn 공매도가능여부 String Y 1
  -stck_shrn_iscd 주식 단축 종목코드 String Y 9
  -fcam_cnnm 액면가 통화명 String Y 20
  -cpfn_cnnm 자본금 통화명 String Y 20 외국주권은 억으로 떨어지며, 그 외에는 만으로 표시됨
  -apprch_rate 접근도 String Y 13
  -frgn_hldn_qty 외국인 보유 수량 String Y 18
  -vi_cls_code VI적용구분코드 String Y 1
  -ovtm_vi_cls_code 시간외단일가VI적용구분코드 String Y 1
  -last_ssts_cntg_qty 최종 공매도 체결 수량 String Y 12
  -invt_caful_yn 투자유의여부 String Y 1 Y/N
  -mrkt_warn_cls_code 시장경고코드 String Y 2 00 : 없음
  01 : 투자주의
  02 : 투자경고
  03 : 투자위험
  -short_over_yn 단기과열여부 String Y 1 Y/N
  -sltr_yn 정리매매여부 String Y 1 Y/N
  Example
  Request
  {
  "fid_cond_mrkt_div_code": "J",
  "fid_input_iscd": "000660"
  }
  Response
  {
  "output": {
  "iscd_stat_cls_code": "55",
  "marg_rate": "20.00",
  "rprs_mrkt_kor_name": "KOSPI200",
  "bstp_kor_isnm": "전기.전자",
  "temp_stop_yn": "N",
  "oprc_rang_cont_yn": "N",
  "clpr_rang_cont_yn": "N",
  "crdt_able_yn": "Y",
  "grmn_rate_cls_code": "40",
  "elw_pblc_yn": "Y",
  "stck_prpr": "128500",
  "prdy_vrss": "0",
  "prdy_vrss_sign": "3",
  "prdy_ctrt": "0.00",
  "acml_tr_pbmn": "344570137500",
  "acml_vol": "2669075",
  "prdy_vrss_vol_rate": "75.14",
  "stck_oprc": "128500",
  "stck_hgpr": "130000",
  "stck_lwpr": "128500",
  "stck_mxpr": "167000",
  "stck_llam": "90000",
  "stck_sdpr": "128500",
  "wghn_avrg_stck_prc": "129097.23",
  "hts_frgn_ehrt": "49.48",
  "frgn_ntby_qty": "0",
  "pgtr_ntby_qty": "287715",
  "pvt_scnd_dmrs_prc": "131833",
  "pvt_frst_dmrs_prc": "130166",
  "pvt_pont_val": "128333",
  "pvt_frst_dmsp_prc": "126666",
  "pvt_scnd_dmsp_prc": "124833",
  "dmrs_val": "129250",
  "dmsp_val": "125750",
  "cpfn": "36577",
  "rstc_wdth_prc": "38500",
  "stck_fcam": "5000",
  "stck_sspr": "97660",
  "aspr_unit": "500",
  "hts_deal_qty_unit_val": "1",
  "lstn_stcn": "728002365",
  "hts_avls": "935483",
  "per": "19.67",
  "pbr": "1.72",
  "stac_month": "12",
  "vol_tnrt": "0.37",
  "eps": "6532.00",
  "bps": "74721.00",
  "d250_hgpr": "149500",
  "d250_hgpr_date": "20210225",
  "d250_hgpr_vrss_prpr_rate": "-14.05",
  "d250_lwpr": "90500",
  "d250_lwpr_date": "20211013",
  "d250_lwpr_vrss_prpr_rate": "41.99",
  "stck_dryy_hgpr": "132500",
  "dryy_hgpr_vrss_prpr_rate": "-3.02",
  "dryy_hgpr_date": "20220103",
  "stck_dryy_lwpr": "121500",
  "dryy_lwpr_vrss_prpr_rate": "5.76",
  "dryy_lwpr_date": "20220105",
  "w52_hgpr": "149500",
  "w52_hgpr_vrss_prpr_ctrt": "-14.05",
  "w52_hgpr_date": "20210225",
  "w52_lwpr": "90500",
  "w52_lwpr_vrss_prpr_ctrt": "41.99",
  "w52_lwpr_date": "20211013",
  "whol_loan_rmnd_rate": "0.22",
  "ssts_yn": "Y",
  "stck_shrn_iscd": "000660",
  "fcam_cnnm": "5,000",
  "cpfn_cnnm": "36,576 억",
  "frgn_hldn_qty": "360220601",
  "vi_cls_code": "N",
  "ovtm_vi_cls_code": "N",
  "last_ssts_cntg_qty": "43916",
  "invt_caful_yn": "N",
  "mrkt_warn_cls_code": "00",
  "short_over_yn": "N",
  "sltr_yn": "N"
  },
  "rt_cd": "0",
  "msg_cd": "MCA00000",
  "msg1": "정상처리 되었습니다!"
  }

# 각 라이브러리의 목적

- react: React 라이브러리로, UI 컴포넌트를 작성하는 데 사용됩니다.
- react-dom: React 컴포넌트를 DOM에 렌더링하는 데 사용됩니다.
- next: Next.js 프레임워크로, 서버 사이드 렌더링 및 정적 사이트 생성을 지원합니다.
- @supabase/auth-helpers-nextjs: Supabase와 Next.js를 통합하여 인증을 쉽게 처리할 수 있게 해줍니다.
- @supabase/supabase-js: Supabase 클라이언트 라이브러리로, Supabase 데이터베이스와 상호작용하는 데 사용됩니다.
- @devextreme/runtime: DevExtreme 컴포넌트의 런타임 라이브러리입니다.
- devextreme: DevExtreme UI 컴포넌트 라이브러리로, 데이터 시각화 및 다양한 UI 요소를 제공합니다.
- devextreme-react: DevExtreme 컴포넌트를 React에서 사용할 수 있게 해줍니다.
- @microsoft/signalr: SignalR 클라이언트 라이브러리로, 실시간 웹 기능을 구현하는 데 사용됩니다.
- axios: HTTP 요청을 보내는 데 사용되는 라이브러리입니다.
- cross-fetch: Fetch API를 Node.js 환경에서 사용할 수 있게 해줍니다.
- luxon: 날짜와 시간을 다루기 위한 라이브러리입니다.
- tailwindcss: 유틸리티 기반의 CSS 프레임워크로, 빠르게 스타일링할 수 있게 해줍니다.
- eslint: JavaScript 및 TypeScript 코드의 정적 분석 도구입니다.
- prettier: 코드 포매터로, 일관된 코드 스타일을 유지하는 데 사용됩니다.
- @typescript-eslint/eslint-plugin: TypeScript와 ESLint를 통합하여 TypeScript 코드를 분석할 수 있게 해줍니다.
- @types/react: React의 TypeScript 타입 정의입니다.
- @types/react-dom: React DOM의 TypeScript 타입 정의입니다.
- @types/node: Node.js의 TypeScript 타입 정의입니다.

```json
{
  "name": "rapid_stock",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@aspnet/signalr": "1.0.27",
    "@devextreme/runtime": "3.0.13",
    "@microsoft/signalr": "^8.0.7",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.4",
    "axios": "^1.7.7",
    "cross-fetch": "^4.0.0",
    "devexpress-diagram": "2.2.11",
    "devexpress-gantt": "4.1.56",
    "devextreme": "^24.1.6",
    "devextreme-cldr-data": "1.0.3",
    "devextreme-quill": "1.7.1",
    "devextreme-react": "^24.1.6",
    "es6-object-assign": "1.1.0",
    "jszip": "3.10.1",
    "luxon": "1.28.1",
    "next": "14.2.13",
    "node-fetch": "^3.3.2",
    "node-polyfill-webpack-plugin": "^1.1.4",
    "prettier": "^3.3.3",
    "prop-types": "15.8.1",
    "react": "^18",
    "react-dom": "^18",
    "rrule": "2.6.4",
    "tslib": "2.6.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.11.1",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@typescript-eslint/eslint-plugin": "^8.7.0",
    "eslint": "^8",
    "tailwindcss": "^3.3.2"
  }
}
```
