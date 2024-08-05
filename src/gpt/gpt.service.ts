import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class GptService {
  private gptClient: OpenAI;

  constructor() {
    this.gptClient = new OpenAI();
  }
  //  mapLink : "https://map.kakao.com/?sName=address&eName=address"
  async test(travleRaws: { title: string; address: string }[]) {
    const jsonFormat = `{
      transportOption : car | publicTransport ,
      detailRoute: {
        address: string;
        placeTitle : string
        routeIndex : number;
        placeImage : string;
        mapx : number
        mapy : number
        day : number
        date : 'xxxx-xx-xx'
        distance: string;
        estimatedTime: string;
        playTime : string
        mapLink : "http://map.naver.com/index.nhn?slng=&slat=&stext=&elng=&elat=&etext&menu=route&pathType=1"
      }[],
      accommodation: { 
        day : number
        address: string;
        title: string;
        image : string;
        site : string;
        mapLink : "https://map.kakao.com/link/search/:name"
      }[]
    }
    `;
    const travleRawsJson = JSON.stringify(travleRaws);

    const te = await this.gptClient.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        {
          role: 'system',
          content: `json형식으로 응답하는데 포맷은  ${jsonFormat} 이런 형식이야`,
        },
        {
          role: 'user',
          content: `${travleRawsJson} 해당 데이터들 중에서 20대 3명이서 2024-08-10 부터 2024-08-14 까지 자차로 여행을 갈건데 
           인천에서 출발해 여행지 순서는 같은 지역 끼리묶고 그다음 서로 거리가 가까운 순으로 일정 짜줘 예상시간은 한국어로 간단하게
           예를 들면 서울에서 출발하면 서울, 경북, 부산 순서로  mapLink는 이전 장소랑 다음에 갈 장소 링크야 그리고 day는 날짜별로 정해줘 그리고 URL에서 띄어쓰기는+로 채워
           `,
        },
      ],
      response_format: { type: 'json_object' },
    });
    console.log(te.choices[0].message.content);
    return te;
  }
}
