/*
 * Copyright 2012 The Netty Project
 *
 * The Netty Project licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
package websocketx;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Echoes uppercase content of text frames.
 */
public class WebSocketFrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> {

//    @Override
//    public void channelActive(ChannelHandlerContext ctx) {
//
//    }
//
//    @Override
//    public void channelInactive(ChannelHandlerContext ctx) {
//
//    }

    String getStrDate(){
        return new SimpleDateFormat("HH:mm:ss").format(new Date());
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) {
        if (frame instanceof PingWebSocketFrame) {
            ctx.channel().writeAndFlush(new PongWebSocketFrame(frame.content().retain()));
            return;
        }
        if (frame instanceof TextWebSocketFrame) {
            // Send the uppercase string back.
            String request = ((TextWebSocketFrame) frame).text();
            if (request.equals("0") || request.length() == 0){
                ctx.channel().writeAndFlush(new TextWebSocketFrame("0"));
                return;
            }
            System.out.println(getStrDate()+ctx.channel().remoteAddress()+"\t"+request);
            int iColon = request.indexOf(":");
            if (iColon == -1) return;
            String cmd = request.substring(0, iColon);
            String sIdx = "";
            String sName = "";
            String sPass = "";
            String OpenID = "";
            String sResponse = "200"; //请求成功
            int i1 = request.indexOf("|", 1); //第一个"|"的位置；
            if (i1 != -1) sName = request.substring(iColon + 1, i1);
            int idx1 = request.indexOf("&", 1); //第一个"|"的位置；
            if (idx1 != -1) OpenID = request.substring(iColon + 1, idx1);
            switch (cmd) {
                case "wxLogin":
                    String userInfo = request.substring(idx1 + 1);
                    Redis.getInstance().setUserInfo(OpenID, userInfo);
                    break;
                case "register":
                    sPass = request.substring(i1 + 1);
                    boolean bSetName = Redis.getInstance().setName(sName, sPass);
                    if (bSetName == false)
                        sResponse = "名字已被注册";
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + sResponse));
                    break;
                case "login":
                    sPass = request.substring(i1 + 1);
                    String sPassTemp = Redis.getInstance().getName(sName);
                    if (sPassTemp == null)
                        sResponse = "用户名不存在";
                    else if (sPassTemp.equals(sPass) == false)
                        sResponse = "密码错误";
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + sResponse));
                    break;
                case "getScore":
                    sName = request.substring(iColon + 1);
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + Redis.getInstance().getStrScore(sName)));
                    break;
                case "getWorldStep":
                    if (request.substring(iColon + 1).length() == 1) return;
                    sIdx = request.substring(iColon + 1, iColon + 2);
                    String sRank = request.substring(iColon + 2);
                    if (sRank == "") return;
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + Redis.getInstance().getWorld(sIdx, sRank)));
                    break;
                case "getStep":
                    if (request.substring(iColon + 1).length() == 1) return;
                    sIdx = request.substring(iColon + 1, iColon + 2);
                    sName = request.substring(iColon + 2);
                    if (sName == "") return;
                    String sStep = Redis.getInstance().getStep(sIdx, sName);
                    if (sStep != null)
                        ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + sStep));
                    break;
                case "getRank":
                    sIdx = request.substring(iColon + 1, iColon + 2);
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + Redis.getInstance().getStrRank(sIdx)));
                    break;
                case "setStep":
                    i1 = request.indexOf("|", 1);
                    if (i1 == -1) return;
                    int i2 = request.indexOf("|", i1 + 1);
                    if (i2 == -1) return;
                    int i3 = request.indexOf("|", i2 + 1);
                    if (i3 == -1) return;
                    sIdx = request.substring(iColon + 1, iColon + 2);
                    sName = request.substring(i1 + 1, i2);
                    float iScore = Float.parseFloat(request.substring(i2 + 1, i3));
                    sStep = request.substring(i3 + 1);
                    Redis redis = Redis.getInstance();
                    redis.addScore(sIdx, redis.getNameFromOpenID(sName), iScore);
                    redis.addStep(sIdx, sName, sStep);
                    break;
            }
        } else {
            String message = "unsupported frame type: " + frame.getClass().getName();
            throw new UnsupportedOperationException(message);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
//        cause.printStackTrace();
        System.out.println(getStrDate()+ctx.channel().remoteAddress()+"\t"+cause);
        ctx.close();
    }
}