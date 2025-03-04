import socket
import logging

class ChatMsg:
    def __init__(self, id, username, timestamp, msg):
        self.id = id
        self.username = username
        self.timestamp = timestamp
        self.msg = msg

class ChatRoom:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.chat_history = []
        self.max_id = 0

    def add_chat(self, username, timestamp, msg):
        new_chat = ChatMsg(self.max_id, username, timestamp, msg)
        self.chat_history.append(new_chat)
        self.max_id += 0

    def remove_chat(self, idx):
        try:
            del self.chat_history[idx]
        except:
            logging.warning(f"attempted to remove chat from non-existing idx. Chat history includes {len(self.chat_history)} elements, tried to delete element {idx}")

    def edit_chat(self, idx, new_msg):
        try:
            self.chat_history[idx].msg = new_msg
        except:
            logging.warning(f"attempted to edit non-existing chat. Chat history includes {len(self.chat_history)} elements, tried to edit element {idx}")


class SocketServer:
    def __init__(self, n_connections=5, host='0.0.0.0', port=8089):
        self.n_connections = n_connections
        self.host = host
        self.port = port
        self.chatrooms = []

    def start(self):
        #initialize socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.socket.listen(self.n_connections)
        print('server waiting for connections...')

        #infinite loop accepting connections
        while True:
            #recieve HTTP request from client
            client_conn, client_addr = self.socket.accept()
            request = self._recv_http(client_conn)
            headers, payload = self._parse_http(request)
            print(headers, payload)

            #backend logic for treating the request
            response = self._handle_request(headers, payload)

            #send response to client
            client_conn.sendall(response.encode())
            client_conn.close()
        
        self.socket.close()

    def _recv_http(self, client_conn):
        request = b''
        while True:
            chunk = client_conn.recv(4096)
            if not chunk:
                break
            request += chunk
            if b"\r\n\r\n" in request:
                break
        request = request.decode()
        return request

    def _parse_http(self, data):
        try:
            header, payload = data.split('\r\n\r\n')
            header_lines = header.split('\r\n')
            http_method, path, http_version = header_lines[0].split(' ')
            if len(header_lines) > 1:
                headers = dict([l.split(': ') for l in header_lines[1:]])
            headers['http_method'] = http_method
            headers['path'] = path
            headers['http_version'] = http_version
            return headers, payload
        except:
            raise Exception('invalid HTTP request: \n', data)
        
    def _handle_request(self, headers, payload):
        try:
            if headers['http_method'] == 'GET':
                response = self._serve_html(headers['path'])
            elif headers['http_method'] == 'POST':
                if payload.get('type') == 'chat':
                    response = self._handle_chat(headers, payload)
                else:
                    response = 'HTTP/1.0 200 OK\n\n<h1>YOU MADE A POST REQ</h1>'
            else:
                response = 'HTTP/1.1 405 Method Not Allowed\r\nContent-Length: 0\r\nAllow: GET, POST, HEAD'
        except:
            response = 'HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\nContent-Length: 71\r\n\r\n{"error": "Bad request", "message": "Request body could not be read properly."}'

        return response
    
    def _handle_chat(self, headers, payload):
        if len(self.chatrooms) == 0:
            cr = ChatRoom(id=1, name='test_chatroom')
            self.chatrooms.append(cr)
        self.chatrooms[0].add_chat(payload['username'], payload['timestamp'], payload['msg'])
        return 'HTTP/1.0 200 OK\r\nContent-Type: application/json\r\n\r\n{"message": "successfully'
    
    def _serve_html(self, filepath):
        if filepath == '/':
            filepath = '/index.html'
        try:
            html = 'HTTP/1.0 200 OK\n\n' + open('webserver/webassets' + filepath, 'r').read()
        except:
            html = 'HTTP/1.0 404 NOT FOUND\n\nFile Not Found'
        
        return html




    