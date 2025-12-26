'use client'

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";

const SignIn = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            console.log('Sign in', data);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <h1 className="form-title">Welcome Back</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-x-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="contact@gmail.com"
                    register={register}
                    error={errors.email}
                    validation={{ required: 'Email is required', pattern: { value: /^\w+@\w+\.\w+$/, message: 'Invalid email format' } }}
                />
                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>

                <FooterLink text="Don't have an account?" linkText="Sign up" href="sign-up" />
            </form>
        </>
    )
}
export default SignIn
