using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Reappear : MonoBehaviour
{
    // Start is called before the first frame update
    Rigidbody rb;
    int timer;
    void Start()
    {
        rb = (Rigidbody)gameObject.GetComponent("Rigidbody");
        timer = 0;
    }

    // Update is called once per frame
    void Update()
    {
        timer++;
        if (timer == 50)
            timer = 0;
        if(gameObject.transform.position.z!=0.5|| rb.velocity.x!=0||rb.velocity.y!=0||rb.velocity.z!=0)
        {
            Reset();
        }
    }
    public void Reset()
    {
        if (timer != 0)
            return;
        float X = Random.RandomRange(-0.6f, 0.4f);
        float Y = Random.RandomRange(-.1f,0.2f);
        gameObject.transform.position = new Vector3(X, Y, 0.5f);
        gameObject.transform.rotation = Quaternion.identity;
        rb.velocity = new Vector3(0, 0, 0);
        rb.angularVelocity = new Vector3(0, 0, 0);

    }
}
