from serial import Serial
from time import sleep

current_serial_port = "/dev/tty.usbserial-0001"
current_serial = Serial(current_serial_port, 9600, timeout=0.01)

print("R")
poll_cmd = [0xA5, 0x02, 0x00, 0x00, 0x02]



def calculate_checksum(arr) -> int:
    sum = 0
    for val in arr:
        sum = sum + int(val, 16)
    return hex(sum % 256).split("x")[-1]


def inference(msg, print_inference=False) -> bool:
    """
    Bit 1: Vend in progress
    Bit 2: Vend Completed Successfully
    Bit 3: Operation Type (1=locker, 0=coil) **Not Required**
    Bit 4: (reserved) **Not Required**
    Bit 5: (reserved) **Not Required**
    Bit 6: No Motor
    Bit 7: Vend Error
    Bit 8: Vend Did Not Succeed
    Note: If “Vend in Progress” is 1, the remaining bits are not valid. When vend completes, Vend in progress is set to 0 and the remaining bits are set and are valid.
    """
    byte2 = msg.split("-")[2]
    bin_byte2 = f"{int(byte2,16):08b}"

    if bin_byte2[0] == "1":
        if print_inference:
            print("Vend In Progress")
        return False

    elif bin_byte2[1] == "1":
        if print_inference:
            print("Vend Complete")
        return True
    elif bin_byte2[5] == "1":
        if print_inference:
            print("No Motor")
        return True

    elif bin_byte2[6] == "1":
        if print_inference:
            print("Vend Error")
        return True

    elif bin_byte2[7] == "1":
        if print_inference:
            print("Vend Did Not Succeed")
        return True


def poll(interval, n):
    i = 1
    while True:
        current_serial.write(bytearray(poll_cmd))
        buffer = current_serial.readline()
        msg = buffer.hex("-")
        if len(msg):
            # print(f"*** Info of {i}th Poll Response ***")
            # print(f'Message = "{msg}"')
            break_loop = inference(msg, True)
            # print("*** End ***")
            if break_loop:
                break
            i = i + 1
            if i > n:
                break
            sleep(interval)


def vend(row, col):
    vend_cmd = ["A5", "07", "00", f"{row-1}{col-1}"]
    checksum = calculate_checksum(vend_cmd[1:])
    vend_cmd.append(checksum)
    for i in range(len(vend_cmd)):
        vend_cmd[i] = int(vend_cmd[i], 16)
    print(f'Vend CMD Request = "{vend_cmd}"')
    current_serial.write(bytearray(vend_cmd))
    buffer = current_serial.readline()
    msg = buffer.hex("-")
    print(f'Vend CMD Response = "{msg}"')
    if len(msg):
        inference(msg, True)
    else:
        print("No Response from VMC")


poll(0.25, 5)
vend(1, 1)
poll(0.5, 10)
