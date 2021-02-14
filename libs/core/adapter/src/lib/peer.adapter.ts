import { Observable } from 'rxjs'

export type PeerConfig = RTCConfiguration

/**
 * Creates a WebRTC connection between a local computer and a remote
 * party. This interface provides methods that make it possible to
 * connect to a remote point, maintaining and monitoring the
 * connection, and closing it when it is no longer needed.
 */
export class PeerAdapter {
  connection: RTCPeerConnection

  /**
   * The `onsignalingstatechange` event handler property of
   * the RTCPeerConnection interface specifies a function
   * to be called when the signalingstatechange event occurs
   * on an RTCPeerConnection interface.
   *
   * @type Observable<RTCPeerConnection>
   */
  onChange: Observable<RTCPeerConnection>
  onCandidate: Observable<RTCIceCandidate>
  onTrack: Observable<MediaStream>

  /**
   * Creates an instance of PeerAdapter.
   * @param PeerConfig config
   */
  constructor(config: PeerConfig) {
    this.connection = new RTCPeerConnection(config)

    this.onChange = new Observable<RTCPeerConnection>((subscriber) => {
      this.connection.addEventListener('signalingstatechange', ({ target }) =>
        subscriber.next(target as RTCPeerConnection)
      )
    })

    this.onCandidate = new Observable<RTCIceCandidate>((subscriber) => {
      this.connection.addEventListener('icecandidate', ({ candidate }) =>
        subscriber.next(candidate)
      )
    })

    let inboundStream: MediaStream = null
    this.onTrack = new Observable<MediaStream>((subscriber) => {
      this.connection.addEventListener('track', ({ track, streams = [] }) => {
        if (!!streams.length) {
          subscriber.next(streams[0])
        } else {
          if (!inboundStream) {
            inboundStream = new MediaStream()
            inboundStream.addTrack(track)
            subscriber.next(inboundStream)
          }
        }
      })
    })
  }

  /**
   * Creation of an SDP offer for the purpose of starting a new WebRTC
   * connection to a remote peer.
   *
   * The SDP offer includes information about any MediaStreamTracks already
   * attached to the WebRTC session, codec, and options supported by the browser,
   * and any candidates already gathered by the ICE agent, for the purpose
   * of being sent over the signaling channel to a potential peer to request
   * a connection or to update the configuration of an existing connection.
   *
   * @param RTCOfferOptions [options]
   * @returns Promise<RTCSessionDescription>
   */
  createOffer(options?: RTCOfferOptions) {
    return new Promise<RTCSessionDescription>((resolve, reject) => {
      this.connection
        .createOffer(options)
        .then((sdp) => this.connection.setLocalDescription(sdp))
        .then(() => resolve(this.connection.localDescription))
        .catch((err) => reject(err))
    })
  }

  /**
   * Creates an SDP answer to an offer received from a remote peer during
   * the offer/answer negotiation of a WebRTC connection.
   *
   * The answer contains information about any media already attached to
   * the session, codecs and options supported by the browser, and any
   * ICE candidates already gathered. The answer is delivered to the
   * returned Promise, and should then be sent to the source of the offer
   * to continue the negotiation process.
   *
   * @param RTCSessionDescription [options]
   * @returns Promise<RTCSessionDescription>
   */
  createAnswer(options?: RTCSessionDescription) {
    return new Promise<RTCSessionDescription>((resolve, reject) => {
      this.connection
        .setRemoteDescription(options)
        .then(() => this.connection.createAnswer())
        .then((sdp) => this.connection.setLocalDescription(sdp))
        .then(() => resolve(this.connection.localDescription))
        .catch((err) => reject(err))
    })
  }

  /**
   * Sets the specified session description as the remote peer's
   * current offer or answer.
   *
   * The description specifies the properties of the remote end
   * of the connection, including the media format. The method
   * takes a single parameter—the session description—and it
   * returns a Promise which is fulfilled once the description
   * has been changed, asynchronously.
   *
   * @param RTCSessionDescription [description]
   * @returns Promise<void>
   */
  setRemote(description?: RTCSessionDescription) {
    return this.connection.setRemoteDescription(
      new RTCSessionDescription(description)
    )
  }

  /**
   * This adds this new remote candidate to the RTCPeerConnection's
   * remote description, which describes the state of the remote
   * end of the connection.
   *
   * @param RTCIceCandidate candidate
   * @returns Promise<void>
   */
  addCandidate(candidate: RTCIceCandidate) {
    return this.connection.addIceCandidate(new RTCIceCandidate(candidate))
  }

  /**
   * Creates a new channel linked with the remote peer, over which
   * any kind of data may be transmitted. This can be useful for
   * back-channel content such as images, file transfer, text chat,
   * game update packets, and so forth.
   *
   * @param string label
   * @param RTCDataChannelInit [options]
   * @returns RTCDataChannel
   */
  createDataChannel(label: string, options?: RTCDataChannelInit) {
    return this.connection.createDataChannel(label, options)
  }

  createCertificate() {
    RTCPeerConnection.generateCertificate({
      name: 'RSASSA-PKCS1-v1_5'
    })
  //   RTCPeerConnection.generateCertificate({
  //     name: 'RSASSA-PKCS1-v1_5',
  //     hash: 'SHA-256',
  //     modulusLength: 2048,
  //     publicExponent: new Uint8Array([1, 0, 1])
  // }).then(function(cert) {
  //   var pc = new RTCPeerConnection({certificates: [cert]});
  // });
  }

  /**
   * Closes the current peer connection
   *
   * @returns void
   */
  close() {
    return this.connection.close()
  }
}
