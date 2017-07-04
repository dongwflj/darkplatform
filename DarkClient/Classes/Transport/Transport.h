#ifndef __Transport_H__
#define __Transport_H__

#include "cocos2d.h"
#include "network/WebSocket.h"
#include "TransportObserver.h"

USING_NS_CC;
using namespace cocos2d::network;

/*与服务器收发的网络通信管理类，继承了WebSocket接口，消息格式为Json字符串*/

class Transport : public Ref, public WebSocket::Delegate {
public:
	static Transport * getInstance();

	virtual bool init();
    
    bool open();
    bool sendLogin();
    bool sendJoin(const std::string& name);
    /**
     * 17 space
     * 18 Q
     * 21 W
     * 22 E
     * 23 R
     * 24 T
     * 25 P
     */
    bool sendAction(uint8_t actionCode);
    bool sendMove(double x, double y);
    bool setObserver(TransportObserver* observer);
    
	virtual void onOpen(WebSocket * ws);		//与服务器建立连接

	virtual void onMessage(WebSocket * ws, const WebSocket::Data & data);		//收到消息

	virtual void onClose(WebSocket * ws);		//连接关闭

	virtual void onError(WebSocket * ws, const WebSocket::ErrorCode & data);		//错误
    
private:
    Transport();

	static Transport * s_Transport;
	WebSocket * _socket;
    TransportObserver* _observer;
};

#endif
