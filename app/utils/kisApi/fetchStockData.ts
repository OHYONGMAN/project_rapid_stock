// app/utils/kisApi/fetchStockData.ts

import axios from "axios";
import { getValidToken } from "./token";

export const fetchStockData = async (symbol: string) => {
    try {
        const token = await getValidToken();
        if (!token) {
            throw new Error("Failed to get access token");
        }

        const response = await axios.get(
            "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
            {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Authorization: `Bearer ${token}`,
                    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
                    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
                    tr_id: "FHKST03010100",
                    custtype: "P",
                },
                params: {
                    FID_COND_MRKT_DIV_CODE: "J",
                    FID_INPUT_ISCD: symbol,
                    FID_INPUT_DATE_1: "20240101",
                    FID_INPUT_DATE_2: Date.now(),
                    FID_PERIOD_DIV_CODE: "D",
                    FID_ORG_ADJ_PRC: "0",
                },
            },
        );

        const output = response.data.output2;
        return output.map((item: any) => ({
            date: item.stck_bsop_date,
            close: parseFloat(item.stck_clpr),
            open: parseFloat(item.stck_oprc),
            high: parseFloat(item.stck_hgpr),
            low: parseFloat(item.stck_lwpr),
            volume: parseInt(item.acml_vol, 10),
        }));
    } catch (error) {
        console.error("Failed to fetch stock data", error);
        throw error;
    }
};
