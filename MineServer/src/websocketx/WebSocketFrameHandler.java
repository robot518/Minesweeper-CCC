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

import java.net.SocketAddress;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Echoes uppercase content of text frames.
 */
public class WebSocketFrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> {
    private static long iCount = 0;
    static HashMap<SocketAddress, ChannelHandlerContext> hCtx = new HashMap<SocketAddress, ChannelHandlerContext>();
    static HashMap<SocketAddress, Integer> hHeartTime = new HashMap<SocketAddress, Integer>();
    long startTime = -1;

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        iCount++;
        if (startTime < 0) {
            startTime = System.currentTimeMillis();
        }
        String sDate = new SimpleDateFormat("MMdd").format(new Date());
        SocketAddress addr = ctx.channel().remoteAddress();
        Redis.getInstance().setRecord(sDate, getStrAddress(addr), -1);
        hCtx.put(addr, ctx);
        hHeartTime.put(addr, 0);
        runHeartBeat(addr);
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        iCount--;
        Long iDate = (System.currentTimeMillis() - startTime) / 1000;
        String sDate = new SimpleDateFormat("MMdd").format(new Date());
        SocketAddress addr = ctx.channel().remoteAddress();
        Redis.getInstance().setRecord(sDate, getStrAddress(addr), iDate);
        hHeartTime.put(addr, -10);
    }

    void runHeartBeat(SocketAddress addr){
        ScheduledExecutorService service = Executors
                .newSingleThreadScheduledExecutor();
        Runnable runnable = new Runnable() {
            public void run() {
                // task to run goes here
                int iTime = hHeartTime.get(addr);
                if (iTime < -5){
                    hHeartTime.remove(addr);
                    ChannelHandlerContext ctx = hCtx.remove(addr);
                    ctx.close();
                    service.shutdown();
                }
                hHeartTime.put(addr, --iTime);
            }
        };
        // 第二个参数为首次执行的延时时间，第三个参数为定时执行的间隔时间
        service.scheduleAtFixedRate(runnable, 30, 30, TimeUnit.SECONDS);
    }

    String getStrAddress(SocketAddress addr){
        String sAddress = addr.toString();
        return sAddress.substring(1, sAddress.indexOf(":"));
    }

    String getStrDate(){
        return new SimpleDateFormat("HH:mm:ss").format(new Date());
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) throws Exception {
        if (frame instanceof TextWebSocketFrame) {
            // Send the uppercase string back.
            String request = ((TextWebSocketFrame) frame).text();
            if (request.length() == 0){
                hHeartTime.put(ctx.channel().remoteAddress(), 0);
                return;
            }
            System.out.println(getStrDate()+ctx.channel().remoteAddress()+"\t"+request);
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
                case "Records":
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + "=" + Redis.getInstance().Records(request.substring(iColon+1), iCount)));
                    break;
                case "Users":
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + "=" + Redis.getInstance().Users()));
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
                case "setWorldMine":
                    String sNum = request.substring(i1);
                    Redis.getInstance().setWorldMine(sName, sNum);
                    break;
                case "getWorldMine":
                    sName = request.substring(iColon + 1);
                    ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + Redis.getInstance().getWolrdMine(sName)));
                    break;
                case "getWorldStep":
                    if (request.substring(iColon + 1).length() == 1)
                        return;
                    sIdx = request.substring(iColon + 1, iColon + 2);
                    String sRank = request.substring(iColon + 2);
                    if (sRank == "")
                        return;
                    String sWorld = Redis.getInstance().getWorld(sIdx, sRank);
                    if (sWorld != null)
                        ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":" + sWorld));
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