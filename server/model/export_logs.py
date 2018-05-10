# example:
#   exec:
#       python3 export_logs.py --cate=pulp --start='2018-04-25T00:00:00' --end='2018-04-25T23:00:00'
#       python3 export_logs.py --id=5adfed44eeb4d6000159e37e
#   check:
#       http://oquqvdmso.bkt.clouddn.com/exportlogs/      +json
#       http://oquqvdmso.bkt.clouddn.com/atflow-log-proxy/images/      +jpg
# ================================================

from ava_auth import AuthFactory
import requests
import uuid
from datetime import datetime
import json
import argparse

ak = "Sj2l3BjGqs47X7fxS_JtrBIsyn2StiV1RI8dppqR"
sk = "DXVZR5iqJlHw7EiWTYrsAgmcV4pVrN8Tb0vfO_Lg"
ak = "F92-G4jA5CkT-eibTAtosv6ETVqhpzaGoVtdsTGM"
sk = "aCQJhOuPEooQGUV56VB7VH6CPFNCzwWZmhBQkA5i"
remoteapi = "http://atnet-apiserver.ava-staging.k8s-xs.qiniu.io/"
#remoteapi = "http://atnet-apiserver.ava.k8s-xs.qiniu.io/"


def exportlogs(ak,sk,cmd,start_time,end_time,uids=[],
    query="label[?type=='classification' && name=='pulp']",
    key="",bucket="ava-test",prefix="exportlogs/"):
    """Submit a job to export serving logs.

    Args:
        ak: Qiniu account access key.
        sk: Qiniu account secret key.
        cmd: cmd of the logs,could be pulp,facex-gender,detect...
        start_time: start time of the logs,could be formatted as 2018-02-21T03:25:00
        end_time: end time of the logs,for example, 2018-02-22T00:00:00
        uids: uid array of the logs,for example,[1380588385, 1381278422]
        query: query string of jmes path query,only the logs that match the jmes path will be exported
               jmes path website:http://jmespath.org/
        key: key of the exported file
        bucket: bucket of the exported file
        prefix: prefix of the exported file

    Returns:
        json of the job id: {"id":"5a8f83b058a9b60001ca3129"}
    """
    factory = AuthFactory(ak,sk)
    url = remoteapi+"v1/dataflows/exportlogs"
    if key=="":
        id = str(uuid.uuid1())
        now = datetime.now()
        nowstr = now.strftime("%Y%m%d%H%M%S")
        key = cmd+"_"+nowstr+"_"+id+".json"
    content = {
        "cmd":cmd,
        "start_time":start_time,
        "end_time":end_time,
        "bucket":bucket,
        "prefix":prefix,
        "key":key,
        "query":query,
        "uid":uids
        #"query":"label[?type=='classification' && name=='pulp'].data|[*][?(class=='pulp')&&score>`0.7`]"
    }

    res = requests.post(url,json=content,auth=factory.get_qiniu_auth())
    ret = json.loads(str(res.content, encoding = "utf8"))
    return ret

def exportstate(id):
    """Get job state.

    Args:
        id: job id.

    Returns:
        json state of the job: 
        {
            "id":"5a8f83b058a9b60001ca3129",
            "uid":1381102889,
            "name":"",
            "desc":"",
            "type":"dataflow",
            "createTime":"2018-02-23T11:00:00.481+08:00",
            "status":"running",
            "message":"",
            "startTime":"2018-02-23T11:00:09.242+08:00",
            "jobType":6,
            "prefix":"",
            "sourceFile":"",
            "targetFile":"",
            "logFile":"",
            "params":{
                "bucket":"ava-test",
                "cmd":"pulp",
                "end_time":"2018-02-22T00:00:00+08:00",
                "key":"pulp_20180223110000_a3386433-1845-11e8-85eb-f40f2431779c.json",
                "prefix":"exportlogs/",
                "query":"label[?type=='classification' \u0026\u0026 name=='pulp']",
                "start_time":"2018-02-21T03:25:00+08:00"
            },
            "targetFileStatistics":{
                "fileCount":0,
                "totalImageSize":0,
                "totalImageDimension":0
            },
            "specVersion":"v1"
        }
    """    
    factory = AuthFactory(ak,sk)
    url = remoteapi+"v1/dataflows/"+id
    res = requests.get(url,auth=factory.get_qiniu_auth())
    ret = json.loads(str(res.content, encoding = "utf8"))
    return ret

def config():
    factory = AuthFactory(ak,sk)
    url = remoteapi+"v1/configuration"
    content = {
        "bucket":"ava-test",
    }
    res = requests.post(url,json=content,auth=factory.get_qiniu_auth())
    print(res.content)   

if __name__=="__main__":
    parser = argparse.ArgumentParser(description='choose to load history/current data')
    parser.add_argument('--id', type=str, default = 'false')
    parser.add_argument('--cate', type=str, default = 'pulp')
    parser.add_argument('--start', type=str, default = '2018-04-15T18:00:00')
    parser.add_argument('--end', type=str, default = '2018-04-15T20:00:00')
    args = parser.parse_args()
    
    if args.id == 'false':
        if args.cate == 'pulp':
            ret = exportlogs(ak,sk,"pulp", args.start, args.end, query="label[?type=='classification' && name=='pulp'].data|[*][?(class=='pulp')&&score>`0.9`]")
        elif args.cate == 'terror':
            ret = exportlogs(ak,sk,"terror-classify", args.start, args.end, query="label[?type=='classification' && name=='terror-classify'].data|[*][?class!='normal'&&score>`0.9`]")
        elif args.cate == 'detection':
            # ret = exportlogs(ak,sk,"terror-detect", args.start, args.end, query="label[?type=='detection' && name=='terror-detect'].data|[*][?class!='normal']")
            # ret = exportlogs(ak,sk,"terror-detect", args.start, args.end, query="[*][?uid=='1381102897'].label[?type=='detection' && name=='terror-detect'].data|[*][?class!='normal']")
            ret = exportlogs(ak,sk,"terror-detect", args.start, args.end, query="label[?type=='detection' && name=='terror-detect'].data|[*][?class!='normal']")
        else:
            ret = exportlogs(ak,sk,"politician", args.start, args.end,query="label[?type=='classification' && name=='politician'].data|[*][?class!='normal'&&score>`0.7`]")
        
        #print(ret)
    else:
        ret = exportstate(args.id)
    # ret = exportstate("5acec70377c9140001d7c3e4")
    #config()
    print(ret)

    pass