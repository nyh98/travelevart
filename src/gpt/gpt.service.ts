import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Place } from 'src/place/entities/place.entity';
import { Irecommendations } from 'src/types/ai-response';

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
      routes: {
        date : 'xxxx-xx-xx'
        detail : { 
                  placeId : number;
                  routeIndex : number;
                  day : number 
                  distance: '약 10Km';
                  estimatedTime: '약 10분';
                  playTime : '2시간'
                  }[]
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
          day의 마지막 여행지의 distance, estimatedTime는 null로 해.`,
        },
      ],
      response_format: { type: 'json_object' },

      temperature: 0.3,
    });

    const answer = JSON.parse(
      result.choices[0].message.content,
    ) as Irecommendations;

    const routes = answer.routes.map((day) => {
      const detail = day.detail.map((route, i) => {
        const currentPlace = travleRaws.find(
          (place) => place.id === route.placeId,
        );

        let mapLink: string;

        //마지막 목적지면 mapLink는 null
        if (i === day.detail.length - 1) {
          mapLink = null;
        } else {
          const { placeId } = day.detail[i + 1];
          const nextPlace = travleRaws.find((place) => place.id === placeId);
          const stext = currentPlace.title.split(' ').join('+');
          const etext = nextPlace.title.split(' ').join('+');

          mapLink = `http://map.naver.com/index.nhn?slng=${currentPlace.mapx}&slat=${currentPlace.mapy}&stext=${stext}&elng=${nextPlace.mapx}&elat=${nextPlace.mapy}&etext=${etext}&menu=route&pathType=1`;
        }

        return {
          ...route,
          address: currentPlace.address,
          placeTitle: currentPlace.title,
          placeImage: currentPlace.image,
          mapx: currentPlace.mapx,
          mapy: currentPlace.mapy,
          mapLink,
        };
      });

      return { day: day.date, detail };
    });

    return { transportOption: transportation, routes };
  }
}
