"use client"

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";
import { getFootprintListAPI } from "@/api/footprint";
import { Footprint } from "@/types/app/footprint";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import dayjs from 'dayjs'
import "./page.scss";

export default function MapContainer() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isDismissable, setIsDismissable] = useState(true); // 默认允许关闭
    const [list, setList] = useState<Footprint[]>([])

    const getFootprintList = async () => {
        const { data } = await getFootprintListAPI()
        setList(data)
    }

    useEffect(() => {
        getFootprintList()
    }, [])

    const [data, setData] = useState<Footprint>({} as Footprint);
    let map: any = null;

    useEffect(() => {
        if (!list.length) return

        // 确保代码仅在客户端执行
        import('@amap/amap-jsapi-loader').then(AMapLoader => {
            // @ts-ignore
            window._AMapSecurityConfig = {
                securityJsCode: process.env.GAODE_SECURITYJS_CODE,
            };

            AMapLoader.load({
                key: process.env.GAODE_KEY_CODE!, // 申请好的Web端开发者Key，首次调用 load 时必填
                version: "2.0",
                plugins: ["AMap.Scale", "AMap.Marker"],
            })
                .then((AMap) => {
                    map = new AMap.Map("container", {
                        // 地图样式
                        mapStyle: "amap://styles/grey",
                        viewMode: "3D", // 是否为3D地图模式
                        zoom: 4.8,
                        center: [105.625368, 37.746599], // 初始化地图中心点位置
                    });

                    // 遍历 locations 数组，创建标记
                    list.forEach((data) => {
                        const marker = new AMap.Marker({
                            position: data.position.split(","), // 标记位置
                            map: map, // 将标记添加到地图
                        });

                        // 点击标记时，设置选中的位置，并打开 Modal
                        marker.on("click", () => {
                            onOpen();
                            setData(data);
                        });
                    });

                    // 点击任意位置清空信息框内容并关闭
                    // map.on("click", () => {
                    //     setData(null);
                    // });
                })
                .catch((e) => {
                    console.log(e);
                });

            return () => map?.destroy();
        });
    }, [list]);

    return (
        <>
            <div id="container"></div>

            <Modal
                size="4xl"
                backdrop="opaque"
                isDismissable={isDismissable}
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (isDismissable || !open) onOpenChange();
                }}
                classNames={{
                    backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
                }}
            >
                <ModalContent className="bg-[rgba(36,40,45,0.9)]">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-center pb-2 text-white">{data.title}</ModalHeader>

                            <ModalBody>
                                <div className="flex flex-col">
                                    <div className="flex flex-col justify-between w-full mb-8">
                                        <p className="overflow-scroll max-h-[210px] text-[#d6d6d6] px-[5px]">{data.content}</p>

                                        <div className="text-sm text-end text-[#a5a5a5] pt-2">
                                            <p>时间：{dayjs(+data.createTime).format('YYYY-MM-DD HH:mm')}</p>
                                            <p>地址：{data.address}</p>
                                        </div>
                                    </div>

                                    <div className={`overflow-scroll flex justify-center w-full ${data.images.length !== 1 ? 'max-h-96' : ''} mb-5`}>
                                        <PhotoProvider
                                            speed={() => 800}
                                            easing={(type) => (type === 2 ? 'cubic-bezier(0.36, 0, 0.66, -0.56)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)')}
                                            onVisibleChange={(visible) => {
                                                // 当图片预览模式打开时，不允许关闭 Modal
                                                setIsDismissable(!visible);
                                            }}
                                        >
                                            <div className={`grid gap-4 ${data.images.length === 1 ? 'grid-cols-1' : ''} ${data.images.length === 2 ? 'grid-cols-2' : ''} ${data.images.length === 3 ? 'grid-cols-3' : ''} ${data.images.length! >= 4 ? 'grid-cols-4' : ''}`}>
                                                {
                                                    data.images.map((item, index) => (
                                                        <PhotoView src={item} key={index}>
                                                            <img src={item} alt="" className="rounded-2xl w-full" />
                                                        </PhotoView>
                                                    ))
                                                }
                                            </div>
                                        </PhotoProvider>
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}