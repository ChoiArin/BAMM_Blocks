function buttonRestore() {
  document.getElementById('joinRoom').disabled = false;
  document.getElementById('joinRoom').value = "Join";
}

function getPeer() {
  return new Peer('', {
    host: 'bbam-admin.herokuapp.com',
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
    path: '/peerjs',
    debug: 2
  });
}

function join(workspace, nick) {
  let room = {peerId:null, roomId:null, peer:null, conn:null};

  document.getElementById('joinRoom').disabled = true;
  
  let peer = getPeer();
  
  peer.on('error', function(err) {
    alert(err);
    buttonRestore();
  });

  peer.on('open', function(id) {
    console.log('peer id:' + id);

    let peerId = id;
    let targetId = prompt("접속할 방의 Peer ID를 입력하세요:");
    
    if(!targetId) {
      buttonRestore();
      peer.destroy();
      return;
    }

    conn = peer.connect(targetId, {
      reliable: true
    });
    
    conn.on('open', function() {
      console.log('room connected.');
      document.getElementById('joinRoom').value = targetId;
    });

    conn.on('data', function(data) {
      console.log(data);
      if(data.length == 2 && data[0] === 'peerId') {
        room.roomId = data[1];
        room.peer = getPeer();
        
        room.peer.on('error', function(err) {
          alert(err);
          buttonRestore();
        });

        room.peer.on('open', function(sid) {
          console.log('subpeer id:' + sid);

          room.peerId = sid;

          room.conn = room.peer.connect(room.roomId, {
            reliable: true
          });

          room.conn.on('open', function() {
            console.log('room subconn.');

            peer.destroy();
            room.conn.send(['nick', nick]);
  
            function sendXML() {
              if(room.peer.destroyed) {
                return;
              }

              console.log(workspace);
              try {
                let svgXML = new XMLSerializer().serializeToString(workspace.getParentSvg());
                room.conn.send(['xml', svgXML]);
                console.log('xml sended.');
              } catch(e) {
                console.log(e);
              }
              
              setTimeout(sendXML, 1000);
            }
            sendXML();

            room.conn.on('close', function() {
              alert('connection closed.');
              buttonRestore();
            });
          });
        });

        function ping() {
          room.peer.socket.send({
            type: 'PING'
          });
          setTimeout(ping, 16000);
        }
        ping();
      }
    });
  });
}