package websocketx;

import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.*;
import io.netty.util.CharsetUtil;
//import sun.security.ssl.Debug;

import static io.netty.handler.codec.http.HttpResponseStatus.OK;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;
import static io.netty.handler.codec.rtsp.RtspResponseStatuses.BAD_REQUEST;

public class HttpServerHandler extends SimpleChannelInboundHandler<HttpObject> {

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) {
        ctx.flush();
    }

    @Override
    public void channelRead0(ChannelHandlerContext ctx, HttpObject msg) {
        if (msg instanceof HttpRequest) {
            HttpRequest req = (HttpRequest) msg;
//            System.out.println("req = " + req.toString());
            String uri = req.uri();
            int idx = uri.indexOf("code=");
            if (idx != -1) {
                String code = uri.substring(idx+5);
                String url = "";
                int idx2 = code.indexOf("tttttt");
                if (idx2 != -1) {
                    code = code.substring(0, idx2);
                    url = "https://developer.toutiao.com/api/apps/jscode2session?appid=tt0c6f7ad293459222&secret=52002a2d13b23349c73e0fcdaeec358762eba4a3&code=" + code;
                }else{
                    url = "https://api.weixin.qq.com/sns/jscode2session?appid=wx4e23a5ec42c5a796&secret=bbf6afa03704649480dc1474c85883cd&js_code=" + code + "&grant_type=authorization_code";
                }
                String data = HttpUtils.get(url);
                String s1 = "session_key", s2 = "\"openid";
                int iSession_key = data.indexOf(s1);
                if (iSession_key == -1) return;
                int iOpenid = data.indexOf(s2);
                String openid = "";
                if (idx2 != -1) openid = data.substring(iOpenid+s2.length()+3, iSession_key-3);
                else openid = data.substring(iOpenid+s2.length()+3, data.length()-2);
//                String usrId = data.substring(iSession_key+s1.length()+3, iSession_key+s1.length()+8)+openid.substring(0, 5);
//                Debug.println(openid, usrId);

                boolean keepAlive = HttpUtil.isKeepAlive(req);
                FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, msg.decoderResult().isSuccess()? OK : BAD_REQUEST,
                        Unpooled.copiedBuffer(openid, CharsetUtil.UTF_8));
                response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");

                if (keepAlive) {
                    // Add 'Content-Length' header only for a keep-alive connection.
                    response.headers().setInt(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());
                    // Add keep alive header as per:
                    // - http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01.html#Connection
                    response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
                }

                ChannelFuture f = ctx.write(response);

                if (!keepAlive) {
                    f.addListener(ChannelFutureListener.CLOSE);
                }
            }
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}