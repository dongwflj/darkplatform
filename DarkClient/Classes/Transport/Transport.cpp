#pragma execution_character_set("utf-8")

#include "Transport.h"

Transport * Transport::s_Transport = NULL;

Transport::Transport()
:_socket(NULL),_observer(NULL)
{
}

Transport * Transport::getInstance()
{
	if (!s_Transport)
	{
		s_Transport = new Transport();
		if (s_Transport && s_Transport->init())
		{
			s_Transport->autorelease();
		}
		else
		{
			CC_SAFE_DELETE(s_Transport);
		}
	}
	return s_Transport;
}

bool Transport::init()
{
    _status = INIT;
    return true;
}

bool Transport::setObserver(TransportObserver* observer) {
    _observer = observer;
    return true;
}

bool Transport::open() {
    if (_socket != NULL) {
        CC_SAFE_DELETE(_socket);
    }
    _socket = new WebSocket();
    _status = CONNECTTING;
    if (!_socket->init(*this, "111.13.138.138:10280"))  //ip:端口
    {
        log("Connect to server failed");
        CC_SAFE_DELETE(_socket);
        return false;
    }
    return true;
}

CONNECT_STATUS Transport::getStatus() {
    return _status;
}

void Transport::onOpen(WebSocket * ws)
{
	log("WebSocket (%p)opened", ws);
    _status = CONNECTED;
    if (_observer != NULL) {
        _observer->onOpen();
    }
}

void Transport::onMessage(WebSocket * ws, const WebSocket::Data & data)
{
    if (data.isBinary) {
        _observer->onMessage(data.bytes);
	}
    else {
        log("Strange, recved text cmd");
    }
}



void Transport::onClose(WebSocket * ws)
{
	log("websocket connection closed.");
	if (ws == _socket) {
		_socket = nullptr;
	}

	CC_SAFE_DELETE(ws);
    if (_observer != NULL) {
        _observer->onClose();
    }
}

void Transport::onError(WebSocket * ws, const WebSocket::ErrorCode & data)
{
	log("Error: %d", data);
    if (_observer != NULL) {
        _observer->onError();
    }
}

bool Transport::sendLogin() {
    if (_socket && _socket->getReadyState() == WebSocket::State::OPEN) {
        unsigned char protocol[5];
        protocol[0] = 254;
        uint32_t* version = (uint32_t*)(protocol+1);
        *version = 5;
        _socket->send(protocol, sizeof(protocol));
        
        unsigned char key[5];
        key[0] = 255;
        uint32_t* value = (uint32_t*)(key+1);
        *value = 0;
        _socket->send(key, sizeof(key));
        log("Login ok");
        return true;
    }
    log("Login failed, socket %p", _socket);
    return false;
}


bool Transport::sendJoin(const std::string& name) {
    if (name.length()> 0) {
        unsigned char join[1 + 2 * name.length()];
        join[0] = 0;
        uint16_t* nickchar = (uint16_t*)(join+1);
        for (int i=0; i<name.length(); i++) {
            *nickchar = (uint16_t)name.at(i);
            nickchar++;
        }
        _socket->send(join, sizeof(join));
        return true;
    }
    log("user name is empty");
    return false;
}

/**
 * 17 space
 * 18 Q
 * 21 W
 * 22 E
 * 23 R
 * 24 T
 * 25 P
*/
bool Transport::sendAction(uint8_t actionCode) {
    unsigned char code[1];
    code[0] = actionCode;
    _socket->send(code, 1);
    return true;
}

bool Transport::sendMove(double x, double y) {
    unsigned char mousemove[17];
    mousemove[0] = 16;
    double* var = (double*)(mousemove+1);
    *var = x;
    var++;
    *var = y;
    _socket->send(mousemove, sizeof(mousemove));
    return false;
}
