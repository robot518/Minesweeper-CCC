package websocketx;

import redis.clients.jedis.*;

import java.util.Set;

public class Redis {
    private JedisPool pool;
    private static Redis redis;
    private String sKeyScore = "score";
    private String sKeyStep = "step";

    public static Redis getInstance(){
        if (redis == null){
            redis = new Redis();
        }
        return redis;
    }

    private JedisPool getPool(){
        if (pool == null){
            pool = new JedisPool(new JedisPoolConfig(), "localhost", Protocol.DEFAULT_PORT, Protocol.DEFAULT_TIMEOUT, "1314");
        }
        return pool;
    }

    public boolean setName(String sName, String sPass){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            if (jedis.get(sName) == null) {
                jedis.set(sName, sPass);
                return true;
            }
            return false;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getName(String sName){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            return jedis.get(sName);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getStep(String sIdx, String sName){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            return jedis.hget(sKeyStep+sIdx, sName);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public void addStep(String sIdx, String sName, String sStep){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            jedis.hset(sKeyStep+sIdx, sName, sStep);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public void addScore(String sIdx, String sName, float iScore){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            /// ... do stuff here ... for example
            Double iScorePre = jedis.zscore(sKeyScore + sIdx, sName);
            if (iScorePre == null || iScore < iScorePre)
                jedis.zadd(sKeyScore + sIdx, iScore, sName);
        } finally {
            // You have to close jedis object. If you don't close then
            // it doesn't release back to pool and you can't get a new
            // resource from pool.
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getStrScore(String sName){
        if (sName == null || sName == "")
            return "";
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            String str = "";
            for (int i = 0; i < 3; i++){
                String sKeyTemp = sKeyScore+i;
                Long iRank = jedis.zrank(sKeyTemp, sName);
                if (iRank != null) {
                    Double iScore = jedis.zscore(sKeyTemp, sName);
                    str += (iRank+1) + "," + iScore + ",";
                    int iRecommend = 0;
                    if (iRank == 0)
                        iRecommend = 1;
                    else if (iRank <= 10)
                        iRecommend = (int) (iRank - 1);
                    else if (iRank <= 100)
                        iRecommend = (int) (iRank - 5);
                    else if (iRank <= 200)
                        iRecommend = (int) (iRank - 10);
                    else if (iRank <= 500)
                        iRecommend = (int) (iRank - 50);
                    else if (iRank <= 1000)
                        iRecommend = (int) (iRank - 100);
                    else {
                        Long iCount = jedis.zcard(sKeyTemp);
                        iRecommend = iCount >= 200 ? 200 : (int) (iCount - 0);
                    }
                    Set<Tuple> st = jedis.zrangeWithScores(sKeyTemp, iRecommend, iRecommend);
                    str += (iRecommend+1) + ",";
                    str += st.toString().replace("], [", ",").replace("[", "").replace("]", "");
                }
                if (i != 3)
                    str += "|";
            }
//            System.out.println(str);
            return str;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getStrRank(String sIdx){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            Set<Tuple> stItems = jedis.zrangeWithScores(sKeyScore + sIdx, 0, 9);
            String str = stItems.toString();
            if (str.length() == 2)
                return "";
            str = str.replace("], [", "|");
            str = str.replace("[", "");
            str = str.replace("]", "");
            return str;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getVersion(){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            String str = jedis.get("version");
            if (str == null) {
                str = "0";
                jedis.set("version", str);
            }
            return str;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public void close(){
        getPool().close();
    }
}
