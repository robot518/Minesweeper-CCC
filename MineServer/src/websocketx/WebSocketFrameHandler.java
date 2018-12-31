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
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;

/**
 * Echoes uppercase content of text frames.
 */
public class WebSocketFrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> {
    private static float iCount = 0;

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ctx.fireChannelActive();
        iCount++;
        System.out.println("channelActive"+iCount);
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        ctx.fireChannelInactive();
        iCount--;
//        Redis.getInstance().close();
        System.out.println("channelInactive"+iCount);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) throws Exception {
        if (frame instanceof TextWebSocketFrame) {
            // Send the uppercase string back.
            String request = ((TextWebSocketFrame) frame).text();
            if (request.length() == 0)
                return;
            System.out.println(request);
            int iColon = request.indexOf(":");
            if (iColon == -1)
                return;
            String cmd = request.substring(0, iColon);
            String sIdx = "";
            String sName = "";
            String sPass = "";
            String sResponse = "200"; //请求成功
            int i1 = request.indexOf("|", 1); //第一个"|"的位置；
            if (i1 != -1)
                sName = request.substring(iColon + 1, i1);
            switch (cmd) {
                case "getConnetedData":
                    ctx.channel().writeAndFlush(new TextWebSocketFrame("getConnetedData" + "=" + iCount));
                    break;
                case "wxLogin":
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
                case "getStep":
                    if (request.substring(iColon + 1).length() == 1)
                        return;
                    sIdx = request.substring(iColon + 1, iColon + 2);
                    sName = request.substring(iColon + 2);
                    if (sName == "")
                        return;
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
                    if (i1 == -1)
                        return;
                    int i2 = request.indexOf("|", i1 + 1);
                    if (i2 == -1)
                        return;
                    int i3 = request.indexOf("|", i2 + 1);
                    if (i3 == -1)
                        return;
                    sIdx = request.substring(iColon + 1, iColon + 2);
                    sName = request.substring(i1 + 1, i2);
                    float iScore = Float.parseFloat(request.substring(i2 + 1, i3));
                    sStep = request.substring(i3 + 1);
                    Redis redis = Redis.getInstance();
                    redis.addScore(sIdx, sName, iScore);
                    redis.addStep(sIdx, sName, sStep);
                    break;
            }
        } else {
            String message = "unsupported frame type: " + frame.getClass().getName();
            throw new UnsupportedOperationException(message);
        }
    }
}
