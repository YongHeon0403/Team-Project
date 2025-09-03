import React, { useEffect, useRef } from "react";

const MapComponent = ({ addr, setAddr }) => {
  const mapContainerRef = useRef(null);


  useEffect(() => {
    console.log("👉 부모에서 내려온 addr:", addr);
  }, [addr]);



  useEffect(() => {

    console.log("주소값 addr : ", addr)

    const script = document.createElement("script");
   script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=b2c7e914cbe3db4c67aa1fb145269baa&autoload=false&libraries=services";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const { kakao } = window;
        const map = new kakao.maps.Map(mapContainerRef.current, {
          center: new kakao.maps.LatLng(37.566826, 126.9786567),
          level: 3,
        });

        const geocoder = new kakao.maps.services.Geocoder();
        const marker = new kakao.maps.Marker();
        const infowindow = new kakao.maps.InfoWindow({ zindex: 1 });

        if(addr){
          console.log("주소있어 ? ", addr)
        }else{
          console.log("주소없어 ? ", addr)
        }

        // ✅ 부모에서 받은 addr로 초기 위치 설정
        if (addr) {
          geocoder.addressSearch(addr, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
              map.setCenter(coords);
              marker.setPosition(coords);
              marker.setMap(map);
              infowindow.setContent(`<div><strong>주소</strong><br>${addr}</div>`);
              infowindow.open(map, marker);
            }
          });
        }




        
        kakao.maps.event.addListener(map, "click", (mouseEvent) => {
          geocoder.coord2Address(
            mouseEvent.latLng.getLng(),
            mouseEvent.latLng.getLat(),
            (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                let clickedAddr = "";
                if (result[0].road_address) {
                  //clickedAddr += "도로명주소: " + result[0].road_address.address_name + " ";
                  clickedAddr = result[0].road_address.address_name;
                }
                //clickedAddr += "지번주소: " + result[0].address.address_name;
                clickedAddr = result[0].address.address_name;

                // 부모 상태 업데이트
                setAddr(clickedAddr);

                const content = `<div><strong>주소</strong><br>${clickedAddr}</div>`;
                marker.setPosition(mouseEvent.latLng);
                marker.setMap(map);
                infowindow.setContent(content);
                infowindow.open(map, marker);
              }
            }
          );
        });
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [addr]); // [] -> [addr] 로 수정됨

  return <div ref={mapContainerRef} style={{ width: "100%", height: "350px" }} />;
};

export default MapComponent;
