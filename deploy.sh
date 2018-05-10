local:
scp server.tar nixiaohui@10.88.0.1:~

jump:
qscp server.tar qboxserver@xs713:~/nixiaohui/

xs713:
kubectl cp server.tar lego-node-3949734885-z13l3:/workspace/

kubectl get po | grep node
kubectl exec -it lego-node-3949734885-z13l3 bash
kubectl log lego-node-3949734885-z13l3
kubectl exec -it lego-mysql-0 bash

kubectl cp app.js lego-node-3949734885-z13l3:/workspace/server/app.js
kubectl cp ./model/DBConnection.js lego-node-3949734885-z13l3:/workspace/server/model/DBConnection.js
kubectl cp ./public/javascript/config.js lego-node-3949734885-z13l3:/workspace/server/public/javascript/config.js