import socket

class SocketServer:
    def __init__(self, n_connections=5, host='0.0.0.0', port=8089):
        self.n_connections = n_connections
        self.host = host
        self.port = port

    def start(self):
        #initialize socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.socket.listen(self.n_connections)
        print('server waiting for connections...')

        #infinite loop accepting connections
        while True:
            client_conn, client_addr = self.socket.accept()
            request = self._recv_http(client_conn)
            headers, payload = self._parse_http(request)

            response = 'HTTP/1.0 200 OK\n\n<h1>Hello World</h1>'
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





    