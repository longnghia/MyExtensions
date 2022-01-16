import subprocess
x = subprocess.check_output(["echo","one","two","three"])
print(x)
print("done")

x = subprocess.check_output(["code","."])
print(x)
print("done")



print('Enter your name:')
x = input()