//
//  TransportObserver.h
//  DarkClient
//
//  Created by Ewen Dong on 17/6/2.
//
//

#ifndef TransportObserver_h
#define TransportObserver_h

class TransportObserver
{
public:
    virtual ~TransportObserver() {}

    virtual void onOpen() = 0;
    virtual void onMessage(char* bytes) = 0;
    virtual void onClose() = 0;		//连接关闭
    virtual void onError() = 0;
};

#endif /* TransportObserver_h */
