using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class reappear : MonoBehaviour
{
    Vector3 originalPosthr;
    Vector3 originalPostarget;
    GameObject thr;
    GameObject target;
    Rigidbody thrrigid;
    Rigidbody targetrigid;
    // -1.1<=x<=1.1  0.1<=y<=1.1 z = 2.7
    // Start is called before the first frame update
    void Start()
    {
        thr = GameObject.Find("Throw");
        target = GameObject.Find("Target");
        originalPosthr = thr.transform.position;
        originalPostarget = target.transform.position;
        thrrigid = (Rigidbody)thr.GetComponent("Rigidbody");
        targetrigid = (Rigidbody)target.GetComponent("Rigidbody");
    }

    // Update is called once per frame
    void Update()
    {
        if(Input.GetKeyDown("space"))
        {
            reset();
        }
    }
    public void reset()
    {
        thr.transform.position = originalPosthr;
        float x = Random.Range(-1.1f, 1.1f);
        float y = Random.Range(0.1f, 1.1f);
        target.transform.position = new Vector3(x,y,2.5f);
        thr.transform.rotation = Quaternion.identity;
        target.transform.rotation = Quaternion.identity;
        thrrigid.velocity = new Vector3(0, 0, 0);
        targetrigid.velocity = new Vector3(0, 0, 0);
        thrrigid.angularVelocity = new Vector3(0, 0, 0);
        targetrigid.angularVelocity = new Vector3(0, 0, 0);
    }
}
