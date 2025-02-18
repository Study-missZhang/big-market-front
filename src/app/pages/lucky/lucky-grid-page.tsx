"use client"

import React, {useState, useRef, useEffect} from 'react'
// @ts-ignore
import {LuckyGrid} from '@lucky-canvas/react'

import {queryRaffleAwardList, randomRaffle} from "@/apis";
import {RaffleAwardVO} from "@/types/RaffleAwardVO";

/**
 * 大转盘文档：https://100px.net/docs/grid.html
 * @constructor
 */
export function LuckyGridPage() {
    // 背景
    const [blocks] = useState([
        {padding: '10px', background: '#869cfa'}
    ])

    const [prizes, setPrizes] = useState([{}])

    const queryParams = new URLSearchParams(window.location.search);
    const strategyId = Number(queryParams.get('strategyId'));

    const queryRaffleAwardListHandle =async () => {
        const result = await queryRaffleAwardList(strategyId);
        const {code, info, data} = await result.json();
        if(code != '0000'){
            window.alert("获取抽奖奖品列表失败 code:" + code + " info:" + info);
            return;
        }
        //创建新数组，使用data.map遍历
        const prizes = data.map((award:RaffleAwardVO , index:Number) => {
            const x = index % 3;
            const y = Math.floor(index / 3);
            return {
                x,y,fonts:[{text: award.awardTitle, top: '35%'}],
            };
        });
        setPrizes(prizes)
    }

    // 调用随机抽奖
    const randomRaffleHandle = async () => { //使用async异步操作
        const result = await randomRaffle(strategyId);  //await是用来等待一个异步操作的完成。这里使用await会暂停，直到randomRaffle返回结果
        const {code, info, data} = await result.json();  //从Http响应中提取JSON数据
        if (code != "0000") {
            window.alert("获取抽奖奖品列表失败 code:" + code + " info:" + info)
            return;
        }
        // 为了方便测试，mock 的接口直接返回 awardIndex 也就是奖品列表中第几个奖品。
        return data.awardIndex ? data.awardIndex : prizes.findIndex(prize =>
            //@ts-ignore
            prize.fonts.some(font => font.id === data.awardId)
        ) + 1;
    }

    const [buttons] = useState([
        {x: 1, y: 1, background: "#7f95d1", fonts: [{text: '开始', top: '35%'}]}
    ])

    const [defaultStyle] = useState([{background: "#b8c5f2"}])

    const myLucky = useRef()

    useEffect(() => {
        queryRaffleAwardListHandle().then(r => {
        });
    }, [])

    return <>
        <LuckyGrid
            ref={myLucky}
            width="300px"
            height="300px"
            rows="3"
            cols="3"
            prizes={prizes}
            defaultStyle={defaultStyle}
            buttons={buttons}
            onStart={() => { // 点击抽奖按钮会触发star回调
                // @ts-ignore
                myLucky.current.play()
                setTimeout(() => {
                    // 抽奖接口
                    randomRaffleHandle().then(prizeIndex => {
                            // @ts-ignore
                            myLucky.current.stop(prizeIndex);
                        }
                    );
                }, 2500)
            }}
            onEnd={
                // @ts-ignore
                prize => {
                    alert('恭喜你抽到【' + prize.fonts[0].text + '】奖品ID【' + prize.fonts[0].id + '】')
                }
            }>

        </LuckyGrid>
    </>

}