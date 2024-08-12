import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Place } from 'src/place/entities/place.entity';

@Injectable()
export class GptService {
  private gptClient: OpenAI;

  constructor() {
    this.gptClient = new OpenAI();
  }

  async recommendations(
    travleRaws: Place[],
    age: number,
    sdate: string,
    edate: string,
    transportation: string,
    people: number,
    concept: string,
  ) {
    const jsonFormat = `{
      transportOption : car | publicTransport ,
      routes: {
        date : 'xxxx-xx-xx'
        detail : { address: string;
                  placeTitle : string
                  routeIndex : number;
                  placeImage : string;
                  mapx : number
                  mapy : number
                  day : number 
                  distance: '약 10Km';
                  estimatedTime: '약 10분';
                  playTime : '2시간'
                  mapLink : "http://map.naver.com/index.nhn?slng=&slat=&stext=&elng=&elat=&etext=&menu=route&pathType=1"
                  }[]
      }[]
      accommodation: { 
        day : number
        address: string;
        title: string;
        reservationLink : https://www.yeogi.com/domestic-accommodations?searchType=KEYWORD&keyword=서울+강남&checkIn=2024-08-06&checkOut=2024-08-07&freeForm=true
      }[]
    }
    `;
    const travleRawsJson = JSON.stringify(travleRaws);

    const result = await this.gptClient.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        {
          role: 'system',
          content: `json형식으로 응답하는데 포맷은  ${jsonFormat} 이런 형식이야. 전체 일정을 다 채워야해`,
        },
        {
          role: 'user',
          content: `${travleRawsJson} 해당 여행지들 중에서 여행지 추천해줘 ${age ? `${age}대들이` : ''} ${people ? `${people}명이서` : ''} ${sdate} 부터 ${edate} 까지 
          ${transportation}로 여행을 갈건데 ${concept ? `여행 컨셉은 ${concept}이고` : ''} 서로 거리가 가까운 순으로 추천해주고.
          day는 날짜별로 정해줘. routeIndex는 day별로 1부터 시작할것. 날마다 최소 한곳은 가게해서 무조건 ${sdate} 부터 ${edate} 까지 일정을 다 채울것. 지역이 여러개 있으면 지역마다 들릴것.
           mapLink는 이전 장소랑 다음에 갈 장소인데 출발점 위도,경도,이름, 도착지 위도 경도, 이름 잘 입력해줘 그리고 URL에서 띄어쓰기는+로 채워. 그날의 마지막 목적지는 mapLink, distance, estimatedTime는 null로 해.`,
        },
      ],
      response_format: { type: 'json_object' },

      temperature: 0.3,
    });

    const answer = JSON.parse(result.choices[0].message.content);
    return answer;
  }
}
