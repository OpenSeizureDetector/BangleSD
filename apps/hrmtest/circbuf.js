class CircBuf {
    constructor(bufSize) {
      this.size = bufSize;
      this.valArr = new Array(bufSize);
      this.idx = 0;
  
      this.getVal = function(n) { 
      /**
       * Return the value stored in position n in the buffer.
       */
  
        let i = n + this.idx;
        if (i>=this.valArr.length)
            i = i - this.valArr.length;
        return(this.valArr[i]);
      };
  
      this.setVal = function(val) {
        /**
         * Add value val to the end of the buffer
         */
        this.valArr[this.idx] = val;
        this.idx++;
        if (this.idx == this.valArr.length)
          this.idx = 0
      };
  
      this.getLastVal = function() {
        /**
         * get the last value added to the buffer
         */
        if (this.idx > 0)
          return this.valArr[this.idx-1];
        else
          return this.valArr[this.valArr.length -1];
      };
  
      this.getFirstVal = function() {
        /**
         * get the first value in the buffer
         */
        // FIXME - this is only correct once the buffer is full
        return this.valArr[this.idx];
      };
  
      this.getMaxMinVals = function() {
        /**
         * return [minVal, maxVal] for the buffer.
         */
        let i = 0;
        let minVal = this.valArr[0];
        let maxVal = this.valArr[0];
        for (i=0;i<this.size;i++) {
          if (this.valArr[i]<minVal)
            minVal = this.valArr[i];
          if (this.valArr[i]>maxVal)
            maxVal = this.valArr[i];
        }
        return [minVal, maxVal];
      }
    }
  }

  function runTests() {
    console.log("CircBuf.runTests()");
    let buf = new CircBuf(5);
    buf.setVal(1);
    buf.setVal(2);
    buf.setVal(3);
    buf.setVal(4);
    buf.setVal(5);
    buf.setVal(6);
    console.log(buf);

    console.log("first="+buf.getFirstVal()+", last="+buf.getLastVal());
    for (let i=0;i<5;i++) {
        console.log("buf("+i+") = "+buf.getVal(i));
    }

    buf.setVal(7);
    buf.setVal(8);
    console.log("first="+buf.getFirstVal()+", last="+buf.getLastVal());
    for (let i=0;i<5;i++) {
        console.log("buf("+i+") = "+buf.getVal(i));
    }
    }

  runTests();